import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { BudgetCategory } from '../types/budget';

type Props = {
  categories?: BudgetCategory[];
};

const BudgetCategoryList = ({ categories = [] }: Props) => {
  // ... component code remains the same ...
};

export default BudgetCategoryList; 