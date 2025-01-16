import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Entry: undefined;
  MainTabs: undefined;
};

type EntryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Entry'
>;

type Props = {
  navigation: EntryScreenNavigationProp;
};

export default function EntryScreen({ navigation }: Props) {
  const handleClose = () => {
    // If we can go back, do that instead of replacing
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={handleClose}
      >
        <Ionicons name="close" size={24} color="#333" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={styles.title}>Add New Transaction</Text>
        {/* We'll add the form components here later */}
        <Text style={styles.placeholder}>Entry form will go here</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.skipText}
        onPress={handleClose}
      >
        <Text style={styles.skipTextContent}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  placeholder: {
    color: '#666',
  },
  skipText: {
    padding: 20,
    alignItems: 'center',
  },
  skipTextContent: {
    color: '#666',
    fontSize: 16,
  },
}); 