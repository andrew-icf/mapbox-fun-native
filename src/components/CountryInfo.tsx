import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { GET_COUNTRY } from '../graphql/queries';

export type Country = { code: string; center: [number, number]; zoom: number };

export const COUNTRIES: Country[] = [
  { code: 'US', center: [-98.5, 39.8], zoom: 3 },
  { code: 'CA', center: [-106.3, 56.1], zoom: 2.5 },
  { code: 'MX', center: [-102.5, 23.6], zoom: 4 },
];

type CountryInfoProps = { onSelectCountry?: (country: Country) => void };

export default function CountryInfo({ onSelectCountry }: CountryInfoProps) {
  const [code, setCode] = useState('US');
  const { data, loading, error } = useQuery(GET_COUNTRY, { variables: { code } });

  return (
    <View style={styles.container}>
      <View style={styles.codes}>
        {COUNTRIES.map((c) => (
          <Pressable
            key={c.code}
            onPress={() => {
              setCode(c.code);
              onSelectCountry?.(c);
            }}
          >
            <Text style={[styles.code, c.code === code && styles.codeActive]}>{c.code}</Text>
          </Pressable>
        ))}
      </View>
      {loading && <Text style={styles.text}>Loading...</Text>}
      {error && <Text style={styles.text}>Error: {error.message}</Text>}
      {data?.country && (
        <Text style={styles.text}>
          {data.country.name}: {data.country.capital} ({data.country.currency})
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  codes: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  code: { fontSize: 14, color: '#6b7280' },
  codeActive: { fontWeight: '700', color: '#2563eb' },
  text: { fontSize: 13, color: '#374151' },
});