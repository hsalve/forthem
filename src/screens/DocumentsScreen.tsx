import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Dimensions, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

import { Colors, Layout, Radius, Shadows, Spacing, Typography } from '../theme';
import { Card, SectionHeader } from '../components';
import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { ParentingPlan } from '../lib/database.types';
import { getParentingPlan, getParentingPlanSignedUrl, uploadParentingPlan } from '../services/parentingPlanService';

type DocCategory = 'Medical' | 'Insurance' | 'School' | 'Legal' | 'Passport';
type FileType = 'pdf' | 'jpg' | 'png' | 'doc';
type Doc = { id: string; name: string; category: DocCategory; type: FileType; size: string; date: string; sharedBy: 'you' | 'sarah'; starred: boolean };

const CATEGORY_CONFIG: Record<DocCategory, { emoji: string; color: string; bg: string }> = {
  Medical: { emoji: '🏥', color: '#F2C94C', bg: '#FEF9E7' },
  Insurance: { emoji: '🛡️', color: '#6FCF97', bg: '#E8F8F0' },
  School: { emoji: '🎒', color: '#6C63FF', bg: '#EDE9FE' },
  Legal: { emoji: '⚖️', color: '#EB5757', bg: '#FDECEC' },
  Passport: { emoji: '🛂', color: '#FB923C', bg: '#FFF1E6' },
};
const FILE_TYPE_CONFIG: Record<FileType, { label: string; color: string; bg: string }> = {
  pdf: { label: 'PDF', color: '#EB5757', bg: '#FDECEC' },
  jpg: { label: 'JPG', color: '#6FCF97', bg: '#E8F8F0' },
  png: { label: 'PNG', color: '#38BDF8', bg: '#E0F2FE' },
  doc: { label: 'DOC', color: '#6C63FF', bg: '#EDE9FE' },
};
const CATEGORIES = Object.keys(CATEGORY_CONFIG) as DocCategory[];
const MOCK_DOCS: Doc[] = [
  { id: 'd1', name: "Noah's Vaccination Record", category: 'Medical', type: 'pdf', size: '1.2 MB', date: 'Today', sharedBy: 'sarah', starred: true },
  { id: 'd2', name: 'School Enrollment Form 2026', category: 'School', type: 'pdf', size: '840 KB', date: 'Yesterday', sharedBy: 'you', starred: false },
  { id: 'd3', name: 'Health Insurance Card', category: 'Insurance', type: 'jpg', size: '320 KB', date: '10 Jun', sharedBy: 'sarah', starred: true },
  { id: 'd4', name: 'Custody Agreement 2024', category: 'Legal', type: 'pdf', size: '2.4 MB', date: '5 Jun', sharedBy: 'you', starred: true },
  { id: 'd5', name: "Noah's Passport", category: 'Passport', type: 'jpg', size: '1.8 MB', date: '2 Jun', sharedBy: 'you', starred: false },
];
const { width: SW } = Dimensions.get('window');
const FOLDER_W = (SW - Layout.screenPaddingH * 2 - Spacing.md) / 2;

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <View style={styles.searchWrap}><Text style={styles.searchIcon}>🔍</Text><TextInput style={styles.searchInput} placeholder="Search documents..." placeholderTextColor={Colors.textDisabled} value={value} onChangeText={onChange} autoCapitalize="none" autoCorrect={false} /></View>;
}

function ParentingPlanCard({ plan, loading, uploading, onUpload, onView }: { plan: ParentingPlan | null; loading: boolean; uploading: boolean; onUpload: () => void; onView: () => void }) {
  const uploaded = !!plan;
  return <Card style={styles.planCard}>
    <View style={styles.planHeader}>
      <View style={[styles.planIconWrap, uploaded && styles.planIconUploaded]}><Text style={styles.planIcon}>{uploaded ? '✓' : '📄'}</Text></View>
      <View style={{ flex: 1 }}><Text style={styles.planTitle}>Parenting Plan</Text><Text style={styles.planSub}>{loading ? 'Checking...' : uploaded ? plan.file_name || 'Parenting Plan.pdf' : 'Not uploaded yet'}</Text></View>
      {uploaded && <View style={styles.planBadge}><Text style={styles.planBadgeText}>PDF</Text></View>}
    </View>

    {!uploaded ? <>
      <Text style={styles.planDesc}>Upload the agreement once. ForThem will use it later to automate custody schedules, handoffs, expense rules, and reminders.</Text>
      <View style={styles.powerList}>{['Custody schedule', 'Expense splits', 'Handoff rules'].map(item => <View key={item} style={styles.powerItem}><Text style={styles.powerCheck}>✓</Text><Text style={styles.powerText}>{item}</Text></View>)}</View>
      <TouchableOpacity style={[styles.planUploadBtn, (loading || uploading) && styles.buttonDisabled]} onPress={onUpload} disabled={loading || uploading}><Text style={styles.planUploadBtnText}>{uploading ? 'Uploading...' : 'Upload PDF'}</Text></TouchableOpacity>
    </> : <>
      <View style={styles.analysisBox}><Text style={styles.analysisTitle}>Saved securely</Text><Text style={styles.analysisText}>AI extraction will connect this document to Calendar and Expenses in a later slice.</Text></View>
      <View style={styles.planActions}><TouchableOpacity style={styles.secondaryBtn} onPress={onView}><Text style={styles.secondaryBtnText}>View</Text></TouchableOpacity><TouchableOpacity style={[styles.primarySmallBtn, uploading && styles.buttonDisabled]} onPress={onUpload} disabled={uploading}><Text style={styles.primarySmallBtnText}>{uploading ? 'Replacing...' : 'Replace'}</Text></TouchableOpacity></View>
    </>}
  </Card>;
}

function PlanUploadSheet({ visible, onClose, onFiles, busy }: { visible: boolean; onClose: () => void; onFiles: () => void; busy: boolean }) {
  return <Modal visible={visible} transparent animationType="slide"><Pressable style={styles.overlay} onPress={busy ? undefined : onClose}><Pressable style={styles.sheet} onPress={e => e.stopPropagation()}><View style={styles.sheetHandle} /><Text style={styles.sheetTitle}>Upload Parenting Plan</Text><Text style={styles.sheetSub}>Choose the PDF of your official agreement. It will be visible only to members of this co-parenting space.</Text><View style={styles.sourceRow}><TouchableOpacity style={styles.sourceTile} onPress={onFiles} disabled={busy}><Text style={styles.sourceEmoji}>📂</Text><Text style={styles.sourceLabel}>{busy ? 'Uploading...' : 'Files'}</Text></TouchableOpacity><TouchableOpacity style={[styles.sourceTile, styles.sourceDisabled]} onPress={() => Alert.alert('Scan coming next', 'Scanning paper pages will be added separately.')} disabled={busy}><Text style={styles.sourceEmoji}>📷</Text><Text style={styles.sourceLabel}>Scan</Text><Text style={styles.sourceSoon}>Coming later</Text></TouchableOpacity></View><TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={busy}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity></Pressable></Pressable></Modal>;
}

function FolderCard({ category, count, onPress }: { category: DocCategory; count: number; onPress: (c: DocCategory) => void }) {
  const cfg = CATEGORY_CONFIG[category];
  return <TouchableOpacity style={styles.folderCard} onPress={() => onPress(category)} activeOpacity={0.72}><View style={[styles.folderTab, { backgroundColor: cfg.color }]} /><View style={[styles.folderBody, { backgroundColor: cfg.bg }]}><Text style={styles.folderEmoji}>{cfg.emoji}</Text><Text style={styles.folderName}>{category}</Text><Text style={[styles.folderCount, { color: cfg.color }]}>{count} file{count !== 1 ? 's' : ''}</Text></View></TouchableOpacity>;
}

function DocRow({ doc, onPress, onStar }: { doc: Doc; onPress: (d: Doc) => void; onStar: (id: string) => void }) {
  const cat = CATEGORY_CONFIG[doc.category]; const ft = FILE_TYPE_CONFIG[doc.type];
  return <TouchableOpacity style={styles.docRow} onPress={() => onPress(doc)} activeOpacity={0.72}><View style={[styles.fileIcon, { backgroundColor: ft.bg }]}><Text style={[styles.fileTypeLabel, { color: ft.color }]}>{ft.label}</Text></View><View style={styles.docInfo}><Text style={styles.docName} numberOfLines={1}>{doc.name}</Text><View style={styles.docMeta}><View style={[styles.catPill, { backgroundColor: cat.bg }]}><Text style={[styles.catPillText, { color: cat.color }]}>{cat.emoji} {doc.category}</Text></View><Text style={styles.docMetaText}>{doc.size} · {doc.date}</Text></View></View><TouchableOpacity onPress={() => onStar(doc.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Text style={[styles.starIcon, doc.starred && styles.starActive]}>{doc.starred ? '★' : '☆'}</Text></TouchableOpacity></TouchableOpacity>;
}

function DocDetailSheet({ doc, onClose, onStar }: { doc: Doc | null; onClose: () => void; onStar: (id: string) => void }) {
  if (!doc) return null; const cat = CATEGORY_CONFIG[doc.category]; const ft = FILE_TYPE_CONFIG[doc.type];
  return <Modal visible={!!doc} animationType="slide" transparent><Pressable style={styles.overlay} onPress={onClose}><Pressable style={styles.sheet} onPress={e => e.stopPropagation()}><View style={styles.sheetHandle} /><View style={[styles.previewArea, { backgroundColor: ft.bg }]}><Text style={styles.previewTypeText}>{ft.label}</Text></View><Text style={styles.sheetFileName}>{doc.name}</Text><View style={styles.sheetMetaRow}><View style={[styles.sheetMetaChip, { backgroundColor: cat.bg }]}><Text style={[styles.sheetMetaText, { color: cat.color }]}>{cat.emoji} {doc.category}</Text></View><View style={styles.sheetMetaChip}><Text style={styles.sheetMetaText}>{doc.size}</Text></View></View><TouchableOpacity style={styles.starToggleBtn} onPress={() => { onStar(doc.id); onClose(); }}><Text style={styles.starToggleText}>{doc.starred ? '★ Remove from starred' : '☆ Add to starred'}</Text></TouchableOpacity></Pressable></Pressable></Modal>;
}

function UploadModal({ visible, onClose, onUpload }: { visible: boolean; onClose: () => void; onUpload: (cat: DocCategory) => void }) {
  const [selected, setSelected] = useState<DocCategory | null>(null);
  return <Modal visible={visible} animationType="slide" transparent><Pressable style={styles.overlay} onPress={onClose}><Pressable style={styles.sheet} onPress={e => e.stopPropagation()}><View style={styles.sheetHandle} /><Text style={styles.sheetTitle}>Upload Document</Text><Text style={styles.uploadSectionLabel}>SAVE TO FOLDER</Text><View style={styles.uploadCatGrid}>{CATEGORIES.map(cat => { const cfg = CATEGORY_CONFIG[cat]; const active = selected === cat; return <TouchableOpacity key={cat} style={[styles.uploadCatTile, active && { borderColor: cfg.color, backgroundColor: cfg.bg }]} onPress={() => setSelected(cat)}><Text style={styles.uploadCatEmoji}>{cfg.emoji}</Text><Text style={[styles.uploadCatLabel, active && { color: cfg.color }]}>{cat}</Text></TouchableOpacity>; })}</View><TouchableOpacity style={[styles.uploadBtn, !selected && styles.uploadBtnDisabled]} onPress={() => selected && onUpload(selected)} disabled={!selected}><Text style={styles.uploadBtnText}>Upload</Text></TouchableOpacity></Pressable></Pressable></Modal>;
}

export default function DocumentsScreen() {
  const { user } = useAuth();
  const { familyId } = useFamily();
  const [docs, setDocs] = useState<Doc[]>(MOCK_DOCS);
  const [query, setQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState<DocCategory | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [planSheetOpen, setPlanSheetOpen] = useState(false);
  const [plan, setPlan] = useState<ParentingPlan | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planUploading, setPlanUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadPlan() {
      if (!familyId) { setPlanLoading(false); return; }
      try { const current = await getParentingPlan(familyId); if (active) setPlan(current); }
      catch (error: any) { if (active) Alert.alert('Parenting Plan', error?.message ?? 'Could not load the parenting plan.'); }
      finally { if (active) setPlanLoading(false); }
    }
    loadPlan();
    return () => { active = false; };
  }, [familyId]);

  function showToast(message: string) { setToast(message); setTimeout(() => setToast(null), 2500); }
  function handleStar(id: string) { setDocs(prev => prev.map(doc => doc.id === id ? { ...doc, starred: !doc.starred } : doc)); }
  function handleUpload(category: DocCategory) { const cfg = CATEGORY_CONFIG[category]; setDocs(prev => [{ id: `d${Date.now()}`, name: `New ${category} document`, category, type: 'pdf', size: '—', date: 'Just now', sharedBy: 'you', starred: false }, ...prev]); setUploadVisible(false); showToast(`${cfg.emoji} Uploaded to ${category}`); }

  async function chooseParentingPlan() {
    if (!familyId || !user) return;
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true, multiple: false });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.mimeType && asset.mimeType !== 'application/pdf' && !asset.name.toLowerCase().endsWith('.pdf')) {
        Alert.alert('PDF required', 'Please choose a PDF parenting plan.');
        return;
      }
      setPlanUploading(true);
      const uploaded = await uploadParentingPlan(familyId, user.id, { uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size }, plan);
      setPlan(uploaded);
      setPlanSheetOpen(false);
      showToast('📄 Parenting plan uploaded');
    } catch (error: any) {
      Alert.alert('Upload failed', error?.message ?? 'Could not upload the parenting plan.');
    } finally { setPlanUploading(false); }
  }

  async function viewParentingPlan() {
    if (!plan?.file_path) return;
    try {
      const url = await getParentingPlanSignedUrl(plan.file_path);
      await Linking.openURL(url);
    } catch (error: any) { Alert.alert('Could not open file', error?.message ?? 'Please try again.'); }
  }

  const filtered = useMemo(() => { let list = docs; if (activeFolder) list = list.filter(doc => doc.category === activeFolder); if (query.trim()) { const q = query.toLowerCase(); list = list.filter(doc => doc.name.toLowerCase().includes(q) || doc.category.toLowerCase().includes(q)); } return list; }, [docs, activeFolder, query]);
  const starredDocs = docs.filter(doc => doc.starred);
  const recentDocs = filtered.filter(doc => ['Today', 'Yesterday'].includes(doc.date));
  const olderDocs = filtered.filter(doc => !['Today', 'Yesterday'].includes(doc.date));
  const isSearching = query.trim().length > 0;
  const isFolderView = !!activeFolder && !isSearching;
  const isDefaultView = !activeFolder && !isSearching;

  return <SafeAreaView style={styles.safe} edges={['top']}>
    {toast && <View style={styles.toast} pointerEvents="none"><Text style={styles.toastText}>{toast}</Text></View>}
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><View><Text style={styles.screenTitle}>Documents</Text><Text style={styles.screenSub}>{docs.length} files shared</Text></View><TouchableOpacity style={styles.uploadFab} onPress={() => setUploadVisible(true)}><Text style={styles.uploadFabIcon}>↑</Text></TouchableOpacity></View>
      <SearchBar value={query} onChange={setQuery} />
      {isFolderView && <TouchableOpacity style={styles.breadcrumb} onPress={() => setActiveFolder(null)}><Text style={styles.breadcrumbBack}>‹</Text><Text style={styles.breadcrumbText}>{CATEGORY_CONFIG[activeFolder].emoji} {activeFolder}</Text><Text style={styles.breadcrumbCount}>{filtered.length} files</Text></TouchableOpacity>}
      {isSearching && <Text style={styles.searchResultLabel}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"</Text>}
      {isDefaultView && <><SectionHeader title="Parenting Plan" style={styles.sectionGap} /><ParentingPlanCard plan={plan} loading={planLoading} uploading={planUploading} onUpload={() => setPlanSheetOpen(true)} onView={viewParentingPlan} /><SectionHeader title="Folders" style={styles.sectionGap} /><View style={styles.folderGrid}>{CATEGORIES.map(category => <FolderCard key={category} category={category} count={docs.filter(doc => doc.category === category).length} onPress={setActiveFolder} />)}</View>{starredDocs.length > 0 && <><SectionHeader title="Starred" style={styles.sectionGap} /><Card noPadding style={styles.docListCard}>{starredDocs.map((doc, index) => <View key={doc.id}>{index > 0 && <View style={styles.rowDivider} />}<DocRow doc={doc} onPress={setSelectedDoc} onStar={handleStar} /></View>)}</Card></>}</>}
      {(isFolderView || isSearching) && (filtered.length === 0 ? <View style={styles.emptyState}><Text style={styles.emptyEmoji}>📭</Text><Text style={styles.emptyTitle}>{isSearching ? 'No results found' : 'Folder is empty'}</Text><Text style={styles.emptySubtext}>{isSearching ? 'Try a different search term' : 'Upload a document to get started'}</Text></View> : <>{recentDocs.length > 0 && <><SectionHeader title="Recent" style={styles.sectionGap} /><Card noPadding style={styles.docListCard}>{recentDocs.map((doc, index) => <View key={doc.id}>{index > 0 && <View style={styles.rowDivider} />}<DocRow doc={doc} onPress={setSelectedDoc} onStar={handleStar} /></View>)}</Card></>}{olderDocs.length > 0 && <><SectionHeader title={recentDocs.length > 0 ? 'Earlier' : 'All files'} style={styles.sectionGap} /><Card noPadding style={styles.docListCard}>{olderDocs.map((doc, index) => <View key={doc.id}>{index > 0 && <View style={styles.rowDivider} />}<DocRow doc={doc} onPress={setSelectedDoc} onStar={handleStar} /></View>)}</Card></>}</>)}
      <View style={{ height: 100 }} />
    </ScrollView>
    <TouchableOpacity style={styles.floatingUploadBtn} onPress={() => setUploadVisible(true)}><Text style={styles.floatingUploadIcon}>↑</Text><Text style={styles.floatingUploadLabel}>Upload</Text></TouchableOpacity>
    <DocDetailSheet doc={selectedDoc} onClose={() => setSelectedDoc(null)} onStar={id => { handleStar(id); setSelectedDoc(null); }} />
    <UploadModal visible={uploadVisible} onClose={() => setUploadVisible(false)} onUpload={handleUpload} />
    <PlanUploadSheet visible={planSheetOpen} onClose={() => setPlanSheetOpen(false)} onFiles={chooseParentingPlan} busy={planUploading} />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background }, scroll: { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md, paddingBottom: 100 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg }, screenTitle: { ...Typography.h1 }, screenSub: { ...Typography.small, marginTop: 2 }, uploadFab: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadows.card }, uploadFabIcon: { fontSize: 20, color: Colors.textInverse, fontWeight: '700' }, searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, height: 48, marginBottom: Spacing.lg, ...Shadows.card }, searchIcon: { fontSize: 16, marginRight: Spacing.sm }, searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, height: '100%' }, breadcrumb: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md, gap: Spacing.sm }, breadcrumbBack: { fontSize: 22, color: Colors.primary, fontWeight: '300' }, breadcrumbText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, flex: 1 }, breadcrumbCount: { ...Typography.small }, searchResultLabel: { ...Typography.small, marginBottom: Spacing.md }, sectionGap: { marginBottom: Spacing.sm, marginTop: Spacing.xs },
  planCard: { marginBottom: Layout.cardGap }, planHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md }, planIconWrap: { width: 48, height: 48, borderRadius: Radius.md, backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center' }, planIconUploaded: { backgroundColor: '#E8F8F0' }, planIcon: { fontSize: 22 }, planTitle: { ...Typography.bodyBold }, planSub: { ...Typography.small, marginTop: 2 }, planBadge: { backgroundColor: Colors.errorBg, paddingVertical: 4, paddingHorizontal: 8, borderRadius: Radius.sm }, planBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.errorText }, planDesc: { ...Typography.small, lineHeight: 20, marginBottom: Spacing.md }, powerList: { gap: 8, marginBottom: Spacing.md }, powerItem: { flexDirection: 'row', alignItems: 'center', gap: 8 }, powerCheck: { color: Colors.successText, fontWeight: '900' }, powerText: { ...Typography.small, color: Colors.textPrimary }, analysisBox: { backgroundColor: Colors.neutralBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md }, analysisTitle: { ...Typography.bodyBold }, analysisText: { ...Typography.small, lineHeight: 18, marginTop: 3 }, planUploadBtn: { height: Layout.buttonHeight, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, planUploadBtnText: { fontSize: 15, fontWeight: '800', color: Colors.textInverse }, planActions: { flexDirection: 'row', gap: Spacing.sm }, secondaryBtn: { flex: 1, height: 46, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' }, secondaryBtnText: { color: Colors.textPrimary, fontWeight: '800' }, primarySmallBtn: { flex: 1, height: 46, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, primarySmallBtnText: { color: Colors.textInverse, fontWeight: '800' }, buttonDisabled: { opacity: 0.55 },
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.md }, folderCard: { width: FOLDER_W, borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.card }, folderTab: { height: 6 }, folderBody: { padding: Spacing.md, paddingTop: Spacing.sm }, folderEmoji: { fontSize: 28, marginBottom: 6 }, folderName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 }, folderCount: { fontSize: 12, fontWeight: '600' }, docListCard: { marginBottom: Spacing.sm, overflow: 'hidden' }, docRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: Layout.cardPadding, gap: Spacing.md }, fileIcon: { width: 44, height: 52, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' }, fileTypeLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }, docInfo: { flex: 1 }, docName: { ...Typography.bodyBold, marginBottom: 5 }, docMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }, catPill: { paddingVertical: 2, paddingHorizontal: 7, borderRadius: Radius.full }, catPillText: { fontSize: 11, fontWeight: '600' }, docMetaText: { ...Typography.tiny }, starIcon: { fontSize: 20, color: Colors.textDisabled }, starActive: { color: Colors.warning }, rowDivider: { height: 1, backgroundColor: Colors.border, marginLeft: Layout.cardPadding + 56 },
  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' }, sheet: { backgroundColor: Colors.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: Layout.cardPadding, paddingBottom: Spacing.xl }, sheetHandle: { alignSelf: 'center', width: 46, height: 4, borderRadius: 2, backgroundColor: Colors.border, marginBottom: Spacing.lg }, sheetTitle: { ...Typography.h2, marginBottom: 4 }, sheetSub: { ...Typography.small, lineHeight: 19, marginBottom: Spacing.lg }, sourceRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }, sourceTile: { flex: 1, height: 104, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.neutralBg, alignItems: 'center', justifyContent: 'center' }, sourceDisabled: { opacity: 0.55 }, sourceEmoji: { fontSize: 26, marginBottom: 6 }, sourceLabel: { ...Typography.bodyBold }, sourceSoon: { ...Typography.tiny, marginTop: 2 }, cancelBtn: { height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' }, cancelText: { color: Colors.textSecondary, fontWeight: '800' }, previewArea: { height: 110, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md }, previewTypeText: { fontSize: 22, fontWeight: '900', letterSpacing: 1 }, sheetFileName: { ...Typography.h3, textAlign: 'center', marginBottom: Spacing.sm }, sheetMetaRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, flexWrap: 'wrap', marginBottom: Spacing.md }, sheetMetaChip: { borderRadius: Radius.full, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: Colors.neutralBg }, sheetMetaText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary }, starToggleBtn: { height: 48, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, starToggleText: { color: Colors.textInverse, fontWeight: '700' }, uploadSectionLabel: { ...Typography.label, marginBottom: Spacing.sm }, uploadCatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg }, uploadCatTile: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 12, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.neutralBg }, uploadCatEmoji: { fontSize: 16 }, uploadCatLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary }, uploadBtn: { height: Layout.buttonHeight, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' }, uploadBtnDisabled: { opacity: 0.45 }, uploadBtnText: { color: Colors.textInverse, fontWeight: '700', fontSize: 15 }, emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 70 }, emptyEmoji: { fontSize: 38, marginBottom: Spacing.sm }, emptyTitle: { ...Typography.h3 }, emptySubtext: { ...Typography.small, marginTop: 4 }, floatingUploadBtn: { position: 'absolute', right: Layout.screenPaddingH, bottom: 24, height: 54, paddingHorizontal: 20, borderRadius: Radius.full, backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, ...Shadows.float }, floatingUploadIcon: { fontSize: 18, color: Colors.textInverse, fontWeight: '800' }, floatingUploadLabel: { fontSize: 15, fontWeight: '800', color: Colors.textInverse }, toast: { position: 'absolute', top: 56, alignSelf: 'center', backgroundColor: Colors.textPrimary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, zIndex: 10, ...Shadows.float }, toastText: { color: Colors.textInverse, fontWeight: '700', fontSize: 13 },
});
