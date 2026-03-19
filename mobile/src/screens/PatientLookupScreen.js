import React, { useState, useCallback } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, ActivityIndicator, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

export default function PatientLookupScreen({ navigation }) {
    const { token } = useAuth();
    const [query, setQuery] = useState('');
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);

    const search = useCallback(async (q) => {
        setQuery(q);
        if (!q || q.length < 2) { setPatients([]); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/patients/search?q=${encodeURIComponent(q)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setPatients(await res.json());
            } else {
                const err = await res.json();
                throw new Error(err.detail || 'Search failed');
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [token]);

    const selectPatient = (patient) => {
        navigation.navigate('VitalsEntry', { patient });
    };

    const renderPatient = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => selectPatient(item)} activeOpacity={0.7}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {(item.first_name?.[0] || '') + (item.last_name?.[0] || '')}
                </Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.cardName}>{item.first_name} {item.last_name}</Text>
                <Text style={styles.cardSub}>
                    ID: {item.national_id || 'N/A'} • {item.gender} • DOB: {item.date_of_birth}
                </Text>
                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#ecfdf5' }]}
                        onPress={() => navigation.navigate('Consultation', { patient: item })}
                    >
                        <Ionicons name="medical" size={14} color="#059669" />
                        <Text style={[styles.actionText, { color: '#059669' }]}>CONSULT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#f5f3ff' }]}
                        onPress={() => navigation.navigate('LabOrder', { patient: item })}
                    >
                        <Ionicons name="flask-outline" size={14} color="#8b5cf6" />
                        <Text style={[styles.actionText, { color: '#8b5cf6' }]}>LAB ORDER</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#f1f5f9' }]}
                        onPress={() => navigation.navigate('PatientHistory', { patient: item })}
                    >
                        <Ionicons name="time-outline" size={14} color="#64748b" />
                        <Text style={[styles.actionText, { color: '#64748b' }]}>HISTORY</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        value={query}
                        onChangeText={search}
                        placeholder="Search by name, ID, or phone..."
                        placeholderTextColor="#94a3b8"
                    />
                    {loading && <ActivityIndicator size="small" color="#059669" />}
                </View>
            </View>

            <FlatList
                data={patients}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderPatient}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="people-outline" size={64} color="#e2e8f0" />
                        <Text style={styles.emptyText}>
                            {query.length >= 2 ? 'No patients found' : 'Search for a patient'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    searchRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    searchBox: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
        borderWidth: 1, borderColor: '#e2e8f0',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6,
        elevation: 2,
    },
    searchInput: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
    card: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: '#f1f5f9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
        elevation: 1,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 14, backgroundColor: '#ecfdf5',
        justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 16, fontWeight: '800', color: '#059669' },
    cardBody: { flex: 1 },
    cardName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    cardSub: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '500' },
    tagRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
    tag: { backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    tagText: { fontSize: 10, fontWeight: '700', color: '#dc2626' },
    cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8
    },
    actionText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '600', marginTop: 12 },
});
