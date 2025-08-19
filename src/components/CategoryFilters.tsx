import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export type FilterType = 'all' | 'todo' | 'progress' | 'done';

interface CategoryFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({ activeFilter, onFilterChange }) => {
  const filters: { key: FilterType; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: '#666' },
    { key: 'todo', label: 'To-Do', color: '#FF5A77' },
    { key: 'progress', label: 'Progress', color: '#FFB833' },
    { key: 'done', label: 'Done', color: '#30D394' },
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            activeFilter === filter.key && { 
              backgroundColor: filter.color,
              borderColor: filter.color 
            }
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === filter.key && styles.activeFilterText
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeFilterText: {
    color: '#ffffff',
  },
});

export default CategoryFilters;