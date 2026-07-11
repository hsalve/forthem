import { db, supabase } from '../lib/supabase';
import { ParentingPlan } from '../lib/database.types';

const BUCKET = 'parenting-plans';

export type ParentingPlanUpload = {
  uri: string;
  name: string;
  mimeType?: string | null;
  size?: number | null;
};

export async function getParentingPlan(familyId: string): Promise<ParentingPlan | null> {
  const { data, error } = await db.parentingPlans()
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function uploadParentingPlan(
  familyId: string,
  userId: string,
  file: ParentingPlanUpload,
  previous?: ParentingPlan | null,
): Promise<ParentingPlan> {
  const response = await fetch(file.uri);
  if (!response.ok) throw new Error('Could not read the selected PDF.');
  const bytes = await response.arrayBuffer();

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${familyId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, {
      contentType: file.mimeType || 'application/pdf',
      upsert: false,
    });
  if (uploadError) throw uploadError;

  try {
    const payload = {
      family_id: familyId,
      uploaded_by: userId,
      file_name: file.name,
      file_path: path,
      file_url: null,
      rules: {},
      ai_extracted: false,
    };

    const { data, error } = await db.parentingPlans()
      .insert(payload)
      .select('*')
      .single();
    if (error) throw error;

    if (previous?.file_path) {
      await supabase.storage.from(BUCKET).remove([previous.file_path]);
      await db.parentingPlans().delete().eq('id', previous.id);
    }

    return data;
  } catch (error) {
    await supabase.storage.from(BUCKET).remove([path]);
    throw error;
  }
}

export async function getParentingPlanSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteParentingPlan(plan: ParentingPlan): Promise<void> {
  if (plan.file_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([plan.file_path]);
    if (storageError) throw storageError;
  }
  const { error } = await db.parentingPlans().delete().eq('id', plan.id);
  if (error) throw error;
}
