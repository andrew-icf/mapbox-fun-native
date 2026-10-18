import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../shared/theme';
import type { Load } from './types';
import {
  badgeLabel,
  formatCurrency,
  formatPickupDate,
  formatPostedAgo,
  formatRatePerMile,
  formatWeight,
} from './loadFormat';

type LoadCardProps = { load: Load };

function LoadCard({ load }: LoadCardProps) {
  return (
    <View style={styles.card} testID={`load-card-${load.id}`}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="truck-outline" size={18} color={colors.textSecondary} />
        <Text style={styles.carrier} numberOfLines={1}>{load.carrier}</Text>
        {load.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeLabel(load.badge)}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.route}>
          <View style={styles.stop}>
            <Ionicons name="ellipse" size={10} color={colors.accent} />
            <Text style={styles.city}>
              {load.origin.city}, {load.origin.state}{' '}
              <Text style={styles.date}>{formatPickupDate(load.pickupDate)}</Text>
            </Text>
          </View>
          <View style={styles.stop}>
            <Ionicons name="ellipse-outline" size={10} color={colors.accent} />
            <Text style={styles.city}>{load.destination.city}, {load.destination.state}</Text>
          </View>
        </View>
        <View style={styles.rateColumn}>
          <Text style={styles.rate}>{formatCurrency(load.rate)}</Text>
          <Text style={styles.perMile}>est {formatRatePerMile(load.ratePerMile)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Chip label={load.equipment} />
        <Chip label={formatWeight(load.weightLbs)} />
        <Chip label={`${load.lengthFt} ft`} />
        <Chip label={load.fullLoad ? 'FULL' : 'PARTIAL'} />
        <Text style={[styles.meta, styles.miles]}>
          {load.miles.toLocaleString('en-US')} mi · {formatPostedAgo(load.postedMinutesAgo)}
        </Text>
      </View>
    </View>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

// memo skips re-rendering a card when its load hasn't changed,
// which matters in long, scrolling lists
export default memo(LoadCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  carrier: { flex: 1, color: colors.textPrimary, fontSize: 16, fontWeight: '600' },
  badge: { backgroundColor: colors.badge, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { color: colors.textPrimary, fontSize: 11, fontWeight: '700' },
  body: { flexDirection: 'row', justifyContent: 'space-between' },
  route: { flex: 1, gap: spacing.xs },
  stop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  city: { color: colors.textPrimary, fontSize: 15 },
  date: { color: colors.textSecondary, fontSize: 14 },
  rateColumn: { alignItems: 'flex-end' },
  rate: { color: colors.money, fontSize: 18, fontWeight: '700' },
  perMile: { color: colors.textSecondary, fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  chip: { backgroundColor: colors.border, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  chipText: { color: colors.textPrimary, fontSize: 11 },
  meta: { color: colors.textSecondary, fontSize: 12 },
  miles: { marginLeft: 'auto' },
});