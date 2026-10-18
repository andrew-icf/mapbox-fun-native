import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../shared/theme';

export default function LoadBoardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Load Board</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '600' },
});