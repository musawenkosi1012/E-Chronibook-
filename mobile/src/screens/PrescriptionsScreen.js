import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, ActivityIndicator, StatusBar,
    RefreshControl, TextInput, TouchableOpacity, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

export default function PrescriptionsScreen() {
    const { token } = useAuth();
    const [prescriptions, setPresciptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [patientId, setPatientId] = useState('');

    const loadPending = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/pharmacy/prescriptions/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setPresciptions(await res.json());
        } catch { }
        setLoading(false);
        setRefreshing(false);
    }, [token]);

    const searchByPatient = async (id) => {
        setPatientId(id);
        if (!id) { loadPending(); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/pharmacy/prescriptions/patient/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) setPresciptions(await res.json());
        } catch { }
        setLoading(false);
    };

    const dispensePrescription = async (prescriptionId) => {
        Alert.alert(
            'Confirm Dispensing',
            'Are you sure you want to mark this prescription as dispensed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const res = await fetch(`${API_BASE}/api/pharmacy/prescriptions/${prescriptionId}/dispense`, {
                                method: 'PATCH',
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (res.ok) {
                                Alert.alert('Success', 'Prescription dispensed successfully');
                                loadPending();
                            } else {
                                const err = await res.json();
                                throw new Error(err.detail || 'Dispensing failed');
                            }
                        } catch (err) {
                            Alert.alert('Error', err.message);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => { loadPending(); }, []);

    const renderRx = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.pillBadge}>
                    <Ionicons name="medical" size={16} color="#f43f5e" />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{item.medication_name}</Text>
                    <Text style={styles.dosage}>{item.dosage} • {item.frequency} • {item.duration}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'dispensed' ? styles.dispensed : styles.pending]}>
                    <Text style={[styles.statusText, item.status === 'dispensed' ? styles.dispensedText : styles.pendingText]}>
                        {item.status}
                    </Text>
                </View>
            </View>
            {item.instructions ? <Text style={styles.instructions}>{item.instructions}</Text> : null}

            {item.status === 'pending' && (
                <TouchableOpacity
                    style={styles.dispenseBtn}
                    onPress={() => dispensePrescription(item.id)}
                >
                    <Ionicons name="checkbox-outline" size={16} color="#fff" />
                    <Text style={styles.dispenseBtnText}>DISPENSE MEDICATION</Text>
                </TouchableOpacity>
            )}

            <View style={styles.cardFooter}>
                <Text style={styles.footerText}>
                    <Ionicons name="person-outline" size={12} color="#94a3b8" /> Patient #{item.patient_id}
                </Text>
                {item.route ? <Text style={styles.footerText}>Route: {item.route}</Text> : null}
                <Text style={styles.footerText}>Qty: {item.quantity}</Text>
                <Text style={styles.footerText}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            {/* Search by Patient ID */}
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        value={patientId}
                        onChangeText={searchByPatient}
                        placeholder="Search by patient ID..."
                        placeholderTextColor="#94a3b8"
                        keyboardType="number-pad"
                    />
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={prescriptions}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderRx}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadPending(); }} colors={['#059669']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="document-text-outline" size={64} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No prescriptions found</Text>
                        </View>
                    }
                />
            )}
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
    },
    searchInput: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '600', marginTop: 12 },
    list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
    card: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#f1f5f9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
        elevation: 1,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    pillBadge: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff1f2',
        justifyContent: 'center', alignItems: 'center',
    },
    medName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    dosage: { fontSize: 12, color: '#64748b', fontWeight: '500', marginTop: 2 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    pending: { backgroundColor: '#fef3c7' },
    dispensed: { backgroundColor: '#d1fae5' },
    statusText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
    pendingText: { color: '#d97706' },
    dispensedText: { color: '#059669' },
    instructions: { fontSize: 13, color: '#475569', marginTop: 10, fontWeight: '500', lineHeight: 18 },
    cardFooter: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12,
        paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9',
    },
    footerText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' },
    dispenseBtn: {
        backgroundColor: '#059669',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 12,
    },
    dispenseBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
