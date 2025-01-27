import { useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  FlatList,
  TextInput,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Option = {
  label: string;
  value: string;
  extraData?: any;
};

type Props = {
  label: string;
  options: { label: string; value: string }[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  canAdd?: boolean;
  onAddNew?: (value: string) => void;
  compact?: boolean;
  renderOption?: (option: Option) => React.ReactNode;
  isDark?: boolean;
};

export default function Dropdown({ 
  label, 
  options, 
  selectedValue, 
  onValueChange, 
  placeholder = 'Select an option',
  canAdd = false,
  onAddNew,
  compact = false,
  renderOption,
  isDark = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  const selectedOption = options.find(opt => opt.value === selectedValue);

  const showModal = () => {
    setIsOpen(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 100,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      setSearchQuery(''); // Clear search when closing
    });
  };

  const handleAddNew = () => {
    if (newValue.trim() && onAddNew) {
      onAddNew(newValue.trim());
      setNewValue('');
      // hideModal();
    }
  };

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    // Don't close the dropdown after selection
    // hideModal();
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  if (compact) {
    return (
      <>
        <TouchableOpacity 
          style={[
            styles.compactSelector,
            isDark && styles.darkMode.button
          ]}
          onPress={showModal}
        >
          <Text style={[
            styles.compactValue,
            isDark && styles.darkMode.buttonText
          ]}>
            {selectedOption?.label || placeholder}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={isDark ? colors.textLight : colors.textTertiary} 
          />
        </TouchableOpacity>

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={hideModal}
          statusBarTranslucent
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={hideModal}
            />
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    })
                  }]
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={hideModal}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {canAdd && (
                  <View style={styles.addNewContainer}>
                    <TextInput
                      style={styles.addNewInput}
                      value={newValue}
                      onChangeText={setNewValue}
                      placeholder={`Add new ${label.toLowerCase()}`}
                      placeholderTextColor={colors.textTertiary}
                    />
                    <TouchableOpacity 
                      style={[
                        styles.addButton,
                        !newValue.trim() && styles.addButtonDisabled
                      ]}
                      onPress={handleAddNew}
                      disabled={!newValue.trim()}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={20} color={colors.textTertiary} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search..."
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="none"
                  />
                  {searchQuery ? (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                      <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <FlatList
                  data={filteredOptions}
                  keyExtractor={item => item.value}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.option,
                        item.value === selectedValue && styles.selectedOption
                      ]}
                      onPress={() => handleSelect(item.value)}
                    >
                      {renderOption ? (
                        renderOption(item)
                      ) : (
                        <Text style={[
                          styles.optionText,
                          item.value === selectedValue && styles.selectedOptionText
                        ]}>
                          {item.label}
                        </Text>
                      )}
                      {item.value === selectedValue && (
                        <Ionicons name="checkmark" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  )}
                  style={styles.optionsList}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.selector}
        onPress={showModal}
      >
        <Text style={[
          styles.value,
          !selectedOption && styles.placeholder
        ]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={colors.textTertiary} 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={hideModal}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hideModal}
          />
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={hideModal}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {canAdd && (
                <View style={styles.addNewContainer}>
                  <TextInput
                    style={styles.addNewInput}
                    value={newValue}
                    onChangeText={setNewValue}
                    placeholder={`Add new ${label.toLowerCase()}`}
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.addButton,
                      !newValue.trim() && styles.addButtonDisabled
                    ]}
                    onPress={handleAddNew}
                    disabled={!newValue.trim()}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textTertiary} />
                <TextInput
                  style={styles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search..."
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <FlatList
                data={filteredOptions}
                keyExtractor={item => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      item.value === selectedValue && styles.selectedOption
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    {renderOption ? (
                      renderOption(item)
                    ) : (
                      <Text style={[
                        styles.optionText,
                        item.value === selectedValue && styles.selectedOptionText
                      ]}>
                        {item.label}
                      </Text>
                    )}
                    {item.value === selectedValue && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
                style={styles.optionsList}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    borderRadius: 12,
    padding: 16,
  },
  value: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textTertiary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalBody: {
    maxHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  addNewContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addNewInput: {
    flex: 1,
    backgroundColor: colors.input,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  optionsList: {
    padding: 16,
    flexGrow: 0,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  selectedOption: {
    backgroundColor: colors.cardLight,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  compactSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.cardLight,
  },
  compactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 4,
  },
  darkMode: {
    button: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    buttonText: {
      color: colors.textLight,
      fontSize: 14,
    },
    icon: {
      color: colors.textLight,
    },
    modal: {
      backgroundColor: colors.card,
    },
    option: {
      borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    optionText: {
      color: colors.textLight,
    },
  },
}); 