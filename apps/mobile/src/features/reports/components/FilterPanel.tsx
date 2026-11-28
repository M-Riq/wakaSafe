import { PILOT_CITIES } from '@wakasafe/domain';
import { StyleSheet, View } from 'react-native';

import { fr } from '@/lib/i18n';
import { AppText, Button, Card, Chip, spacing } from '@/ui';

import { activeFilterCount, NO_FILTERS, toggleValue, type MapFilters } from '../filters';
import { CATEGORY_ICONS, REPORT_CATEGORIES, SEVERITIES } from '../presentation';

interface FilterPanelProps {
  filters: MapFilters;
  onChange: (filters: MapFilters) => void;
}

/** F2.3 filters: type and severity (several values), zone (one pilot city). */
export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <Card testID="map-filters">
      <FilterGroup label={fr.reportMap.category}>
        {REPORT_CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={fr.enums.reportCategory[category]}
            icon={CATEGORY_ICONS[category]}
            selected={filters.categories.includes(category)}
            onPress={() =>
              onChange({ ...filters, categories: toggleValue(filters.categories, category) })
            }
            testID={`filter-category-${category}`}
          />
        ))}
      </FilterGroup>
      <FilterGroup label={fr.reportMap.severity}>
        {SEVERITIES.map((severity) => (
          <Chip
            key={severity}
            label={fr.enums.severity[severity]}
            selected={filters.severities.includes(severity)}
            onPress={() =>
              onChange({ ...filters, severities: toggleValue(filters.severities, severity) })
            }
            testID={`filter-severity-${severity}`}
          />
        ))}
      </FilterGroup>
      <FilterGroup label={fr.reportMap.zone} radio>
        <Chip
          role="radio"
          label={fr.reportMap.allZones}
          icon="globe-outline"
          selected={filters.city === null}
          onPress={() => onChange({ ...filters, city: null })}
          testID="filter-city-all"
        />
        {PILOT_CITIES.map((city) => (
          <Chip
            key={city}
            role="radio"
            label={city}
            icon="location-outline"
            selected={filters.city === city}
            onPress={() => onChange({ ...filters, city })}
            testID={`filter-city-${city}`}
          />
        ))}
      </FilterGroup>
      {activeFilterCount(filters) > 0 && (
        <Button
          label={fr.reportMap.resetFilters}
          variant="ghost"
          icon="close-circle-outline"
          onPress={() => onChange(NO_FILTERS)}
          testID="filter-reset"
        />
      )}
    </Card>
  );
}

function FilterGroup({
  label,
  radio = false,
  children,
}: {
  label: string;
  radio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.group} role={radio ? 'radiogroup' : 'group'} aria-label={label}>
      <AppText variant="label">{label}</AppText>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
