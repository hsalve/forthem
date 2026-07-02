import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius, Shadows, Layout, Typography } from '../theme';
import { Card, SectionHeader } from '../components';

// ─── Types ────────────────────────────────────────────────────────────────────

type DocCategory = 'Medical' | 'Insurance' | 'School' | 'Legal' | 'Passport';
type FileType    = 'pdf' | 'jpg' | 'png' | 'doc';
type Doc = {
  id: string; name: string; category: DocCategory; type: FileType;
  size: string; date: string; sharedBy: 'you' | 'sarah'; starred: boolean;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<DocCategory, { emoji: string; color: string; bg: string }> = {
  Medical:   { emoji: '🏥', color: '#F2C94C', bg: '#FEF9E7' },
  Insurance: { emoji: '🛡️', color: '#6FCF97', bg: '#E8F8F0' },
  School:    { emoji: '🎒', color: '#6C63FF', bg: '#EDE9FE' },
  Legal:     { emoji: '⚖️', color: '#EB5757', bg: '#FDECEC' },
  Passport:  { emoji: '🛂', color: '#FB923C', bg: '#FFF1E6' },
};

const FILE_TYPE_CONFIG: Record<FileType, { label: string; color: string; bg: string }> = {
  pdf: { label:'PDF', color:'#EB5757', bg:'#FDECEC' },
  jpg: { label:'JPG', color:'#6FCF97', bg:'#E8F8F0' },
  png: { label:'PNG', color:'#38BDF8', bg:'#E0F2FE' },
  doc: { label:'DOC', color:'#6C63FF', bg:'#EDE9FE' },
};

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as DocCategory[];

// ─── Parenting Plan Mock Rules ────────────────────────────────────────────────

const PLAN_RULES = [
  { category:'Daycare',              split:'65% You / 35% Sarah', icon:'🧸' },
  { category:'Medical',              split:'50/50',                icon:'🏥' },
  { category:'School',               split:'50/50',                icon:'🎒' },
  { category:'Activities',           split:'50/50',                icon:'🎨' },
  { category:'Reimbursement deadline',split:'7 days',             icon:'⏱️' },
  { category:'Travel notice',        split:'30 days',              icon:'✈️' },
];

// ─── Mock Documents ───────────────────────────────────────────────────────────

const MOCK_DOCS: Doc[] = [
  { id:'d1',  name:"Noah's Vaccination Record",   category:'Medical',   type:'pdf', size:'1.2 MB', date:'Today',    sharedBy:'sarah', starred:true  },
  { id:'d2',  name:'School Enrollment Form 2026', category:'School',    type:'pdf', size:'840 KB', date:'Yesterday',sharedBy:'you',   starred:false },
  { id:'d3',  name:'Health Insurance Card',       category:'Insurance', type:'jpg', size:'320 KB', date:'10 Jun',   sharedBy:'sarah', starred:true  },
  { id:'d4',  name:'Custody Agreement 2024',      category:'Legal',     type:'pdf', size:'2.4 MB', date:'5 Jun',    sharedBy:'you',   starred:true  },
  { id:'d5',  name:"Noah's Passport",             category:'Passport',  type:'jpg', size:'1.8 MB', date:'2 Jun',    sharedBy:'you',   starred:false },
  { id:'d6',  name:'Allergy Report — Dr. Mehta',  category:'Medical',   type:'pdf', size:'560 KB', date:'28 May',   sharedBy:'sarah', starred:false },
  { id:'d7',  name:'Term 2 Report Card',          category:'School',    type:'pdf', size:'720 KB', date:'20 May',   sharedBy:'sarah', starred:false },
  { id:'d8',  name:'Insurance Policy Renewal',    category:'Insurance', type:'pdf', size:'3.1 MB', date:'15 May',   sharedBy:'you',   starred:false },
  { id:'d9',  name:"Noah's Birth Certificate",    category:'Legal',     type:'pdf', size:'1.1 MB', date:'Apr 2026', sharedBy:'you',   starred:true  },
  { id:'d10', name:'Permission Slip — Camp Willow',category:'School',   type:'pdf', size:'290 KB', date:'Apr 2026', sharedBy:'sarah', starred:false },
];

// ─── Parenting Plan Card ──────────────────────────────────────────────────────

type PlanCardProps = {
  uploaded: boolean;
  onUpload: () => void;
};

function ParentingPlanCard({ uploaded, onUpload }: PlanCardProps) {
  if (!uploaded) {
    return (
      <Card style={styles.planCard}>
        <View style={styles.planCardTop}>
          <View style={styles.planIconWrap}>
            <Text style={styles.planIcon}>⚖️</Text>
          </View>
          <View style={styles.planCardInfo}>
            <Text style={styles.planCardTitle}>Parenting Plan</Text>
            <Text style={styles.planCardSub}>Upload to auto-extract split rules</Text>
          </View>
        </View>
        <Text style={styles.planCardDesc}>
          Upload your parenting plan PDF and ForThem will extract expense split rules, timelines, and custody rules automatically.
        </Text>
        <View style={styles.planAiBanner}>
          <Text style={styles.planAiIcon}>🤖</Text>
          <Text style={styles.planAiText}>AI rule extraction — coming soon</Text>
        </View>
        <TouchableOpacity style={styles.planUploadBtn} onPress={onUpload} activeOpacity={0.8}>
          <Text style={styles.planUploadBtnText}>↑  Upload Parenting Plan</Text>
        </TouchableOpacity>
      </Card>
    );
  }

  return (
    <Card style={styles.planCard}>
      <View style={styles.planCardTop}>
        <View style={[styles.planIconWrap, { backgroundColor: '#E8F8F0' }]}>
          <Text style={styles.planIcon}>✅</Text>
        </View>
        <View style={styles.planCardInfo}>
          <Text style={styles.planCardTitle}>Parenting Plan</Text>
          <Text style={[styles.planCardSub, { color: Colors.successText }]}>Uploaded · Rules extracted</Text>
        </View>
        <View style={styles.planUploadedBadge}>
          <Text style={styles.planUploadedBadgeText}>PDF</Text>
        </View>
      </View>

      {/* Extracted rules */}
      <Text style={styles.planRulesLabel}>EXTRACTED RULES</Text>
      {PLAN_RULES.map((rule, i) => (
        <View key={rule.category}>
          {i > 0 && <View style={styles.rulesDivider} />}
          <View style={styles.ruleRow}>
            <Text style={styles.ruleEmoji}>{rule.icon}</Text>
            <View style={styles.ruleInfo}>
              <Text style={styles.ruleCategory}>{rule.category}</Text>
            </View>
            <Text style={styles.ruleSplit}>{rule.split}</Text>
          </View>
        </View>
      ))}

      <View style={styles.planAiBanner}>
        <Text style={styles.planAiIcon}>🤖</Text>
        <Text style={styles.planAiText}>
          AI extraction coming later — rules above are mocked for demo
        </Text>
      </View>
    </Card>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.searchWrap}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search documents…"
        placeholderTextColor={Colors.textDisabled}
        value={value} onChangeText={onChange}
        autoCapitalize="none" autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
}

// ─── Folder Card ──────────────────────────────────────────────────────────────

const { width: SW } = Dimensions.get('window');
const FOLDER_W = (SW - Layout.screenPaddingH * 2 - Spacing.md) / 2;

function FolderCard({ category, count, onPress }: { category: DocCategory; count: number; onPress:(c:DocCategory)=>void }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <TouchableOpacity style={styles.folderCard} onPress={() => onPress(category)} activeOpacity={0.72}>
      <View style={[styles.folderTab, { backgroundColor: cfg.color }]} />
      <View style={[styles.folderBody, { backgroundColor: cfg.bg }]}>
        <Text style={styles.folderEmoji}>{cfg.emoji}</Text>
        <Text style={styles.folderName}>{category}</Text>
        <Text style={[styles.folderCount, { color: cfg.color }]}>{count} file{count!==1?'s':''}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Doc Row ──────────────────────────────────────────────────────────────────

function DocRow({ doc, onPress, onStar }: { doc: Doc; onPress:(d:Doc)=>void; onStar:(id:string)=>void }) {
  const cat = CATEGORY_CONFIG[doc.category];
  const ft  = FILE_TYPE_CONFIG[doc.type];
  return (
    <TouchableOpacity style={styles.docRow} onPress={() => onPress(doc)} activeOpacity={0.72}>
      <View style={[styles.fileIcon, { backgroundColor: ft.bg }]}>
        <Text style={[styles.fileTypeLabel, { color: ft.color }]}>{ft.label}</Text>
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
        <View style={styles.docMeta}>
          <View style={[styles.catPill, { backgroundColor: cat.bg }]}>
            <Text style={[styles.catPillText, { color: cat.color }]}>{cat.emoji} {doc.category}</Text>
          </View>
          <Text style={styles.docMetaText}>{doc.size}  ·  {doc.date}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => onStar(doc.id)} hitSlop={{ top:10,bottom:10,left:10,right:10 }}>
        <Text style={[styles.starIcon, doc.starred && styles.starActive]}>{doc.starred ? '★' : '☆'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// ─── Doc Detail Sheet ─────────────────────────────────────────────────────────

function DocDetailSheet({ doc, onClose, onStar }: { doc: Doc | null; onClose:()=>void; onStar:(id:string)=>void }) {
  if (!doc) return null;
  const cat = CATEGORY_CONFIG[doc.category];
  const ft  = FILE_TYPE_CONFIG[doc.type];
  const actions = [{ emoji:'👁️',label:'View' },{ emoji:'⬇️',label:'Download' },{ emoji:'📤',label:'Share' },{ emoji:'🗑️',label:'Delete' }];
  return (
    <Modal visible={!!doc} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={[styles.previewArea, { backgroundColor: ft.bg }]}>
            <Text style={styles.previewTypeText}>{ft.label}</Text>
          </View>
          <Text style={styles.sheetFileName}>{doc.name}</Text>
          <View style={styles.sheetMetaRow}>
            <View style={[styles.sheetMetaChip, { backgroundColor: cat.bg }]}>
              <Text style={[styles.sheetMetaText, { color: cat.color }]}>{cat.emoji}  {doc.category}</Text>
            </View>
            <View style={styles.sheetMetaChip}><Text style={styles.sheetMetaText}>{doc.size}</Text></View>
            <View style={styles.sheetMetaChip}><Text style={styles.sheetMetaText}>{doc.sharedBy==='you'?'👨 You':'👩 Sarah'}</Text></View>
          </View>
          <Text style={styles.sheetDate}>Added {doc.date}</Text>
          <View style={styles.actionsGrid}>
            {actions.map(a => (
              <TouchableOpacity key={a.label} style={[styles.actionTile, a.label==='Delete' && styles.actionTileDestructive]} activeOpacity={0.72} onPress={a.label==='Delete' ? onClose : undefined}>
                <Text style={styles.actionTileEmoji}>{a.emoji}</Text>
                <Text style={[styles.actionTileLabel, a.label==='Delete' && styles.actionTileLabelDestructive]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.starToggleBtn} onPress={() => { onStar(doc.id); onClose(); }}>
            <Text style={styles.starToggleText}>{doc.starred ? '★  Remove from starred' : '☆  Add to starred'}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────

function UploadModal({ visible, onClose, onUpload }: { visible:boolean; onClose:()=>void; onUpload:(cat:DocCategory)=>void }) {
  const [selected, setSelected] = useState<DocCategory | null>(null);
  const sources = [{ emoji:'📷',label:'Camera' },{ emoji:'🖼️',label:'Photos' },{ emoji:'📂',label:'Files' }];
  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <Text style={styles.uploadTitle}>Upload Document</Text>
          <View style={styles.sourceRow}>
            {sources.map(s => (
              <TouchableOpacity key={s.label} style={styles.sourceTile} activeOpacity={0.72}>
                <Text style={styles.sourceTileEmoji}>{s.emoji}</Text>
                <Text style={styles.sourceTileLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.uploadSectionLabel}>SAVE TO FOLDER</Text>
          <View style={styles.uploadCatGrid}>
            {CATEGORIES.map(cat => {
              const cfg = CATEGORY_CONFIG[cat];
              const active = selected === cat;
              return (
                <TouchableOpacity key={cat} style={[styles.uploadCatTile, active && { borderColor:cfg.color, backgroundColor:cfg.bg }]} onPress={() => setSelected(cat)} activeOpacity={0.72}>
                  <Text style={styles.uploadCatEmoji}>{cfg.emoji}</Text>
                  <Text style={[styles.uploadCatLabel, active && { color:cfg.color }]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={[styles.uploadBtn, !selected && styles.uploadBtnDisabled]} onPress={() => selected && onUpload(selected)} disabled={!selected} activeOpacity={0.8}>
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DocumentsScreen() {
  const [docs,           setDocs]           = useState<Doc[]>(MOCK_DOCS);
  const [query,          setQuery]          = useState('');
  const [activeFolder,   setActiveFolder]   = useState<DocCategory | null>(null);
  const [selectedDoc,    setSelectedDoc]    = useState<Doc | null>(null);
  const [uploadVisible,  setUploadVisible]  = useState(false);
  const [planUploaded,   setPlanUploaded]   = useState(false);
  const [toast,          setToast]          = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  function handleStar(id: string) { setDocs(prev => prev.map(d => d.id===id ? {...d, starred:!d.starred} : d)); }

  function handleUpload(category: DocCategory) {
    const cfg = CATEGORY_CONFIG[category];
    setDocs(prev => [{ id:`d${Date.now()}`, name:`New ${category} document`, category, type:'pdf', size:'—', date:'Just now', sharedBy:'you', starred:false }, ...prev]);
    setUploadVisible(false);
    showToast(`${cfg.emoji}  Uploaded to ${category}`);
  }

  function handlePlanUpload() {
    setPlanUploaded(true);
    showToast('⚖️  Parenting plan uploaded · Rules extracted');
  }

  const filtered = useMemo(() => {
    let list = docs;
    if (activeFolder) list = list.filter(d => d.category === activeFolder);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    return list;
  }, [docs, activeFolder, query]);

  const recentDocs  = filtered.filter(d => ['Today','Yesterday'].includes(d.date));
  const olderDocs   = filtered.filter(d => !['Today','Yesterday'].includes(d.date));
  const starredDocs = docs.filter(d => d.starred);

  const isSearching   = query.trim().length > 0;
  const isFolderView  = !!activeFolder && !isSearching;
  const isDefaultView = !activeFolder && !isSearching;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {toast && <View style={styles.toast} pointerEvents="none"><Text style={styles.toastText}>{toast}</Text></View>}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Documents</Text>
            <Text style={styles.screenSub}>{docs.length} files shared with Sarah</Text>
          </View>
          <TouchableOpacity style={styles.uploadFab} onPress={() => setUploadVisible(true)} activeOpacity={0.8}>
            <Text style={styles.uploadFabIcon}>↑</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <SearchBar value={query} onChange={setQuery} />

        {/* Folder breadcrumb */}
        {isFolderView && (
          <TouchableOpacity style={styles.breadcrumb} onPress={() => setActiveFolder(null)} activeOpacity={0.7}>
            <Text style={styles.breadcrumbBack}>‹</Text>
            <Text style={styles.breadcrumbText}>{CATEGORY_CONFIG[activeFolder].emoji}  {activeFolder}</Text>
            <Text style={styles.breadcrumbCount}>{filtered.length} files</Text>
          </TouchableOpacity>
        )}

        {isSearching && <Text style={styles.searchResultLabel}>{filtered.length} result{filtered.length!==1?'s':''} for "{query}"</Text>}

        {/* Default view */}
        {isDefaultView && (
          <>
            {/* ── Parenting Plan Card ── */}
            <SectionHeader title="Parenting Plan" style={styles.sectionGap} />
            <ParentingPlanCard uploaded={planUploaded} onUpload={handlePlanUpload} />

            {/* Folders */}
            <SectionHeader title="Folders" style={styles.sectionGap} />
            <View style={styles.folderGrid}>
              {CATEGORIES.map(cat => (
                <FolderCard key={cat} category={cat} count={docs.filter(d=>d.category===cat).length} onPress={setActiveFolder} />
              ))}
            </View>

            {/* Starred */}
            {starredDocs.length > 0 && (
              <>
                <SectionHeader title="Starred" style={styles.sectionGap} />
                <Card noPadding style={styles.docListCard}>
                  {starredDocs.map((doc, i) => (
                    <View key={doc.id}>
                      {i > 0 && <View style={styles.rowDivider} />}
                      <DocRow doc={doc} onPress={setSelectedDoc} onStar={handleStar} />
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Recent */}
            {recentDocs.length > 0 && (
              <>
                <SectionHeader title="Recent" style={styles.sectionGap} />
                <Card noPadding style={styles.docListCard}>
                  {recentDocs.map((doc, i) => (
                    <View key={doc.id}>
                      {i > 0 && <View style={styles.rowDivider} />}
                      <DocRow doc={doc} onPress={setSelectedDoc} onStar={handleStar} />
                    </View>
                  ))}
                </Card>
              </>
            )}
          </>
        )}

        {/* Folder / search results */}
        {(isFolderView || isSearching) && (
          filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>{isSearching ? 'No results found' : 'Folder is empty'}</Text>
              <Text style={styles.emptySubtext}>{isSearching ? 'Try a different search term' : 'Upload a document to get started'}</Text>
            </View>
          ) : (
            <>
              {recentDocs.length > 0 && (
                <>
                  <SectionHeader title="Recent" style={styles.sectionGap} />
                  <Card noPadding style={styles.docListCard}>
                    {recentDocs.map((doc,i) => <View key={doc.id}>{i>0 && <View style={styles.rowDivider}/>}<DocRow doc={doc} onPress={setSelectedDoc} onStar={handleStar}/></View>)}
                  </Card>
                </>
              )}
              {olderDocs.length > 0 && (
                <>
                  <SectionHeader title={recentDocs.length > 0 ? 'Earlier' : 'All files'} style={styles.sectionGap} />
                  <Card noPadding style={styles.docListCard}>
                    {olderDocs.map((doc,i) => <View key={doc.id}>{i>0 && <View style={styles.rowDivider}/>}<DocRow doc={doc} onPress={setSelectedDoc} onStar={handleStar}/></View>)}
                  </Card>
                </>
              )}
            </>
          )
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.floatingUploadBtn} onPress={() => setUploadVisible(true)} activeOpacity={0.85}>
        <Text style={styles.floatingUploadIcon}>↑</Text>
        <Text style={styles.floatingUploadLabel}>Upload</Text>
      </TouchableOpacity>

      <DocDetailSheet doc={selectedDoc} onClose={() => setSelectedDoc(null)} onStar={id => { handleStar(id); setSelectedDoc(null); }} />
      <UploadModal visible={uploadVisible} onClose={() => setUploadVisible(false)} onUpload={handleUpload} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Layout.screenPaddingH, paddingTop: Spacing.md, paddingBottom: 100 },

  header:       { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:Spacing.lg },
  screenTitle:  { ...Typography.h1 },
  screenSub:    { ...Typography.small, marginTop: 2 },
  uploadFab:    { width:44, height:44, borderRadius:22, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center', ...Shadows.card },
  uploadFabIcon:{ fontSize:20, color:Colors.textInverse, fontWeight:'700' },

  searchWrap:  { flexDirection:'row', alignItems:'center', backgroundColor:Colors.card, borderRadius:Radius.lg, paddingHorizontal:Spacing.md, height:48, marginBottom:Spacing.lg, ...Shadows.card },
  searchIcon:  { fontSize:16, marginRight:Spacing.sm },
  searchInput: { flex:1, fontSize:15, color:Colors.textPrimary, height:'100%' },

  breadcrumb:       { flexDirection:'row', alignItems:'center', marginBottom:Spacing.md, gap:Spacing.sm },
  breadcrumbBack:   { fontSize:22, color:Colors.primary, fontWeight:'300' },
  breadcrumbText:   { fontSize:16, fontWeight:'700', color:Colors.textPrimary, flex:1 },
  breadcrumbCount:  { ...Typography.small },
  searchResultLabel:{ ...Typography.small, marginBottom:Spacing.md },
  sectionGap:       { marginBottom:Spacing.sm, marginTop:Spacing.xs },

  // Parenting plan card
  planCard:        { marginBottom:Layout.cardGap },
  planCardTop:     { flexDirection:'row', alignItems:'center', marginBottom:Spacing.md },
  planIconWrap:    { width:48, height:48, borderRadius:Radius.md, backgroundColor:Colors.errorBg, alignItems:'center', justifyContent:'center', marginRight:Spacing.md },
  planIcon:        { fontSize:24 },
  planCardInfo:    { flex:1 },
  planCardTitle:   { ...Typography.bodyBold },
  planCardSub:     { ...Typography.small, marginTop:2 },
  planUploadedBadge:{ backgroundColor:Colors.errorBg, paddingVertical:4, paddingHorizontal:8, borderRadius:Radius.sm },
  planUploadedBadgeText:{ fontSize:11, fontWeight:'800', color:Colors.errorText },
  planCardDesc:    { ...Typography.small, lineHeight:20, marginBottom:Spacing.md },
  planAiBanner:    { flexDirection:'row', alignItems:'center', gap:Spacing.sm, backgroundColor:'#F5F3FF', borderRadius:Radius.md, padding:Spacing.md, marginBottom:Spacing.md },
  planAiIcon:      { fontSize:16 },
  planAiText:      { fontSize:12, fontWeight:'500', color:Colors.primary, flex:1 },
  planUploadBtn:   { height:Layout.buttonHeight, borderRadius:Radius.md, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center' },
  planUploadBtnText:{ fontSize:15, fontWeight:'700', color:Colors.textInverse },

  // Extracted rules
  planRulesLabel: { ...Typography.label, marginBottom:Spacing.sm },
  rulesDivider:   { height:1, backgroundColor:Colors.border, marginVertical:10 },
  ruleRow:        { flexDirection:'row', alignItems:'center', gap:Spacing.sm },
  ruleEmoji:      { fontSize:18, width:28 },
  ruleInfo:       { flex:1 },
  ruleCategory:   { fontSize:14, fontWeight:'600', color:Colors.textPrimary },
  ruleSplit:      { fontSize:13, fontWeight:'700', color:Colors.primary },

  // Folders
  folderGrid: { flexDirection:'row', flexWrap:'wrap', gap:Spacing.md, marginBottom:Spacing.md },
  folderCard: { width:FOLDER_W, borderRadius:Radius.lg, overflow:'hidden', ...Shadows.card },
  folderTab:  { height:6, borderTopLeftRadius:Radius.lg, borderTopRightRadius:Radius.lg },
  folderBody: { padding:Spacing.md, paddingTop:Spacing.sm, borderBottomLeftRadius:Radius.lg, borderBottomRightRadius:Radius.lg },
  folderEmoji:{ fontSize:28, marginBottom:6 },
  folderName: { fontSize:14, fontWeight:'700', color:Colors.textPrimary, marginBottom:2 },
  folderCount:{ fontSize:12, fontWeight:'600' },

  docListCard: { marginBottom:Spacing.sm, overflow:'hidden' },
  docRow:      { flexDirection:'row', alignItems:'center', paddingVertical:13, paddingHorizontal:Layout.cardPadding, gap:Spacing.md },
  fileIcon:    { width:44, height:52, borderRadius:Radius.sm, alignItems:'center', justifyContent:'center' },
  fileTypeLabel:{ fontSize:11, fontWeight:'800', letterSpacing:0.5 },
  docInfo:     { flex:1 },
  docName:     { ...Typography.bodyBold, marginBottom:5 },
  docMeta:     { flexDirection:'row', alignItems:'center', flexWrap:'wrap', gap:6 },
  catPill:     { paddingVertical:2, paddingHorizontal:7, borderRadius:Radius.full },
  catPillText: { fontSize:11, fontWeight:'600' },
  docMetaText: { ...Typography.tiny },
  starIcon:    { fontSize:20, color:Colors.textDisabled },
  starActive:  { color:Colors.warning },
  rowDivider:  { height:1, backgroundColor:Colors.border, marginLeft:Layout.cardPadding+44+Spacing.md },

  emptyState:  { paddingVertical:60, alignItems:'center', gap:Spacing.sm },
  emptyEmoji:  { fontSize:48 },
  emptyTitle:  { ...Typography.h3, marginTop:Spacing.sm },
  emptySubtext:{ ...Typography.small, textAlign:'center' },

  floatingUploadBtn:   { position:'absolute', bottom:24, right:Layout.screenPaddingH, flexDirection:'row', alignItems:'center', gap:Spacing.sm, backgroundColor:Colors.primary, borderRadius:Radius.full, paddingVertical:14, paddingHorizontal:22, ...Shadows.modal },
  floatingUploadIcon:  { fontSize:18, color:Colors.textInverse, fontWeight:'700' },
  floatingUploadLabel: { fontSize:15, fontWeight:'700', color:Colors.textInverse },

  toast:     { position:'absolute', top:60, left:Layout.screenPaddingH, right:Layout.screenPaddingH, zIndex:999, backgroundColor:Colors.textPrimary, borderRadius:Radius.md, paddingVertical:12, paddingHorizontal:Spacing.md, alignItems:'center', ...Shadows.modal },
  toastText: { color:Colors.textInverse, fontSize:14, fontWeight:'600' },

  overlay: { flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  sheet:   { backgroundColor:Colors.card, borderTopLeftRadius:Radius.xl, borderTopRightRadius:Radius.xl, padding:Layout.screenPaddingH, paddingBottom:Spacing.xxl, ...Shadows.modal },
  sheetHandle:    { width:40, height:4, borderRadius:2, backgroundColor:Colors.border, alignSelf:'center', marginBottom:Spacing.lg },
  sheetFileName:  { ...Typography.h2, marginBottom:Spacing.sm },
  sheetMetaRow:   { flexDirection:'row', flexWrap:'wrap', gap:Spacing.sm, marginBottom:6 },
  sheetMetaChip:  { paddingVertical:5, paddingHorizontal:10, borderRadius:Radius.full, backgroundColor:Colors.background },
  sheetMetaText:  { fontSize:12, fontWeight:'600', color:Colors.textSecondary },
  sheetDate:      { ...Typography.tiny, marginBottom:Spacing.lg },
  previewArea:    { height:100, borderRadius:Radius.lg, alignItems:'center', justifyContent:'center', marginBottom:Spacing.md },
  previewTypeText:{ fontSize:28, fontWeight:'800', letterSpacing:2 },
  actionsGrid:    { flexDirection:'row', gap:Spacing.sm, marginBottom:Spacing.md },
  actionTile:            { flex:1, alignItems:'center', backgroundColor:Colors.background, borderRadius:Radius.md, paddingVertical:Spacing.md, gap:5 },
  actionTileDestructive: { backgroundColor:Colors.errorBg },
  actionTileEmoji:       { fontSize:20 },
  actionTileLabel:       { fontSize:11, fontWeight:'600', color:Colors.textSecondary },
  actionTileLabelDestructive:{ color:Colors.errorText },
  starToggleBtn:  { alignItems:'center', paddingVertical:Spacing.md },
  starToggleText: { fontSize:14, fontWeight:'600', color:Colors.primary },

  uploadTitle:        { ...Typography.h2, marginBottom:4 },
  uploadSectionLabel: { ...Typography.label, marginBottom:Spacing.sm, marginTop:Spacing.lg },
  sourceRow:          { flexDirection:'row', gap:Spacing.md, marginTop:Spacing.md },
  sourceTile:         { flex:1, alignItems:'center', backgroundColor:Colors.background, borderRadius:Radius.lg, paddingVertical:Spacing.md, gap:6, borderWidth:1.5, borderColor:Colors.border },
  sourceTileEmoji:    { fontSize:24 },
  sourceTileLabel:    { fontSize:12, fontWeight:'600', color:Colors.textSecondary },
  uploadCatGrid:      { flexDirection:'row', flexWrap:'wrap', gap:Spacing.sm, marginBottom:Spacing.lg },
  uploadCatTile:      { flexDirection:'row', alignItems:'center', gap:6, paddingVertical:9, paddingHorizontal:14, borderRadius:Radius.full, backgroundColor:Colors.background, borderWidth:1.5, borderColor:Colors.border },
  uploadCatEmoji:     { fontSize:16 },
  uploadCatLabel:     { fontSize:13, fontWeight:'600', color:Colors.textSecondary },
  uploadBtn:          { height:Layout.buttonHeight, borderRadius:Radius.md, backgroundColor:Colors.primary, alignItems:'center', justifyContent:'center' },
  uploadBtnDisabled:  { opacity:0.4 },
  uploadBtnText:      { fontSize:15, fontWeight:'700', color:Colors.textInverse },
});
