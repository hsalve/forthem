import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Baby, LogOut, Mail, Pencil, Plus, User } from 'lucide-react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useFamily } from '../context/FamilyContext';
import { Card, Icon, SectionHeader } from '../components';
import { Colors, Layout, Radius, Shadows, Spacing, Typography } from '../theme';
import type { MainStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'Profile'>;

function getInitial(value?: string | null) {
  return value?.trim()?.[0]?.toUpperCase() ?? 'P';
}

export default function ProfileScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();
  const { family, children } = useFamily();

  const email = user?.email ?? 'No email available';
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    email.split('@')[0] ||
    'Parent';

  function handleSignOut() {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  function notReady(label: string) {
    Alert.alert('Coming next', `${label} will be editable in the next profile update.`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
            <Icon icon={ArrowLeft} size="sm" color={Colors.textPrimary} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial(displayName)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{displayName}</Text>
            <View style={styles.emailRow}>
              <Icon icon={Mail} size="xs" color={Colors.textSecondary} strokeWidth={1.8} />
              <Text style={styles.email}>{email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => notReady('Parent profile')} activeOpacity={0.75}>
            <Icon icon={Pencil} size="sm" color={Colors.primary} strokeWidth={1.9} />
          </TouchableOpacity>
        </Card>

        <SectionHeader title="Family" style={styles.section} />
        <Card style={styles.familyCard}>
          <View style={styles.familyIcon}>
            <Icon icon={User} size="md" color={Colors.primary} strokeWidth={1.8} />
          </View>
          <View style={styles.familyInfo}>
            <Text style={styles.familyName}>{family?.name ?? 'Your family'}</Text>
            <Text style={styles.familyMeta}>{children?.length ?? 0} child{children?.length === 1 ? '' : 'ren'} connected</Text>
          </View>
        </Card>

        <SectionHeader
          title="Children"
          action="Add child"
          onAction={() => notReady('Adding another child')}
          style={styles.section}
        />

        {children && children.length > 0 ? (
          children.map((child: any) => {
            const childName = [child.first_name, child.last_name].filter(Boolean).join(' ') || 'Child';
            return (
              <TouchableOpacity key={child.id} activeOpacity={0.78} onPress={() => notReady(`${childName}'s profile`)}>
                <Card style={styles.childCard}>
                  <View style={styles.childAvatar}>
                    <Icon icon={Baby} size="md" color={Colors.primary} strokeWidth={1.8} />
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{childName}</Text>
                    <Text style={styles.childMeta}>
                      {child.date_of_birth ? `DOB ${child.date_of_birth}` : 'Date of birth not set'}
                    </Text>
                    {!!child.school_name && <Text style={styles.childMeta}>{child.school_name}</Text>}
                  </View>
                  <Icon icon={Pencil} size="sm" color={Colors.textSecondary} strokeWidth={1.8} />
                </Card>
              </TouchableOpacity>
            );
          })
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No children added yet</Text>
            <Text style={styles.emptyText}>Add a child profile so ForThem can personalize schedules, expenses, and documents.</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => notReady('Adding a child')} activeOpacity={0.8}>
              <Icon icon={Plus} size="sm" color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.primaryButtonText}>Add child</Text>
            </TouchableOpacity>
          </Card>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
          <Icon icon={LogOut} size="sm" color={Colors.error} strokeWidth={1.9} />
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>

        <View style={{ height: Layout.screenPaddingB }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Layout.screenPaddingH,
    paddingTop: Spacing.md,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  backButtonPlaceholder: { width: 42, height: 42 },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  profileInfo: { flex: 1 },
  name: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 5,
  },
  email: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: Layout.sectionSpacing,
    marginBottom: Layout.sectionLabelMb,
  },
  familyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  familyIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyInfo: { flex: 1 },
  familyName: {
    ...Typography.body,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  familyMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  childAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.secondary + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  childInfo: { flex: 1 },
  childName: {
    ...Typography.body,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  childMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  emptyCard: {
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.body,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: Spacing.sm,
    height: 46,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  signOutButton: {
    marginTop: Layout.sectionSpacing,
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.error + '20',
  },
  signOutText: {
    color: Colors.error,
    fontWeight: '800',
    fontSize: 15,
  },
});
