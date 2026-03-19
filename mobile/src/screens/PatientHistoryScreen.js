import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, ActivityIndicator,
    StatusBar, ScrollView, RefreshControl, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

export default function PatientHistoryScreen({ route }) {
    const { patient } = route.params;
    const { token } = useAuth();
    const [encounters, setEncounters] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [labOrders, setLabOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [encRes, rxRes, labRes] = await Promise.all([
                fetch(`${API_BASE}/api/encounters/patient/${patient.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/api/pharmacy/prescriptions/patient/${patient.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                fetch(`${API_BASE}/api/lab/orders/patient/${patient.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            if (encRes.ok) setEncounters(await encRes.json());
            if (rxRes.ok) setPrescriptions(await rxRes.json());
            if (labRes?.ok) setLabOrders(await labRes.json());
        } catch (err) {
            Alert.alert('Error', 'Failed to load medical history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [patient.id, token]);

    useEffect(() => { loadData(); }, [loadData]);

    const renderEncounter = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <Ionicons name="medical-outline" size={20} color="#059669" />
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.encounter_type.toUpperCase()}</Text>
                    <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={styles.institutionBadge}>
                    <Text style={styles.institutionText}>ID: {item.institution_id}</Text>
                </View>
            </View>

            {item.chief_complaint ? (
                <View style={styles.complaintBox}>
                    <Text style={styles.complaintLabel}>Chief Complaint</Text>
                    <Text style={styles.complaintText}>{item.chief_complaint}</Text>
                </View>
            ) : null}

            {item.diagnoses && item.diagnoses.length > 0 && (
                <View style={styles.dxList}>
                    {item.diagnoses.map(dx => (
                        <View key={dx.id} style={styles.dxTag}>
                            <Text style={styles.dxLabel}>{dx.description}</Text>
                            <Text style={styles.dxLevel}>{dx.severity}</Text>
                        </View>
                    ))}
                </View>
            )}

            {item.vitals && item.vitals.length > 0 && (
                <View style={styles.vitalsPreview}>
                    {item.vitals.slice(0, 1).map(v => (
                        <View key={v.id} style={styles.vitalRow}>
                            <Text style={styles.vitalTag}>BP: {v.systolic_bp}/{v.diastolic_bp}</Text>
                            <Text style={styles.vitalTag}>HR: {v.heart_rate}</Text>
                            <Text style={styles.vitalTag}>Temp: {v.temperature}°C</Text>
                            <Text style={styles.vitalTag}>SpO2: {v.spo2}%</Text>
                        </View>
                    ))}
                </View>
            )}

            {item.clinical_notes ? (
                <Text style={styles.notesText} numberOfLines={2}>{item.clinical_notes}</Text>
            ) : null}
        </View>
    );

    const renderPrescription = ({ item }) => (
        <View style={styles.historyCard}>
            <View style={styles.cardHeader}>
                <Ionicons name="pill-outline" size={20} color="#f43f5e" />
                <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.medication_name}</Text>
                    <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, item.status === 'dispensed' ? styles.dispensed : styles.pending]}>
                    <Text style={[styles.statusText, item.status === 'dispensed' ? styles.dispensedText : styles.pendingText]}>{item.status}</Text>
                </View>
            </View>
            <Text style={styles.rxDetails}>{item.dosage} • {item.frequency} • {item.duration}</Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#059669" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={['#059669']} />}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text>
                    <Text style={styles.patientMeta}>{patient.gender} • {patient.date_of_birth} • ID: {patient.national_id || 'N/A'}</Text>
                </View>

                <Text style={styles.sectionHeader}>Clinical Encounters</Text>
                {encounters.length > 0 ? (
                    encounters.map(item => <View key={item.id}>{renderEncounter({ item })}</View>)
                ) : (
                    <Text style={styles.emptyText}>No clinical encounters recorded.</Text>
                )}

                <Text style={styles.sectionHeader}>Prescription History</Text>
                {prescriptions.length > 0 ? (
                    prescriptions.map(item => <View key={item.id}>{renderPrescription({ item })}</View>)
                ) : (
                    <Text style={styles.emptyText}>No prescriptions recorded.</Text>
                )}

                <Text style={styles.sectionHeader}>Laboratory Results</Text>
                {labOrders.length > 0 ? (
                    labOrders.map(item => (
                        <View key={item.id} style={styles.historyCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="flask-outline" size={20} color="#8b5cf6" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cardTitle}>{item.test_name}</Text>
                                    <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                                </View>
                                <View style={[styles.statusBadge, styles[item.status]]}>
                                    <Text style={styles.statusText}>{item.status}</Text>
                                </View>
                            </View>
                            {item.results && item.results.length > 0 ? (
                                item.results.map(r => (
                                    <View key={r.id} style={styles.resBox}>
                                        <Text style={[styles.resVal, r.is_abnormal === 'abnormal' && { color: '#ef4444' }]}>
                                            {r.result_value} {r.unit}
                                        </Text>
                                        <Text style={styles.resRange}>Ref: {r.reference_range}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.pendingText}>Result pending...</Text>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.emptyText}>No lab results recorded.</Text>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    patientInfo: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    patientName: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    patientMeta: { fontSize: 14, color: '#64748b', marginTop: 4, fontWeight: '500' },
    sectionHeader: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 12, marginBottom: 12 },
    historyCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
        borderWidth: 1, borderColor: '#f1f5f9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
        elevation: 1,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    cardTitle: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
    cardDate: { fontSize: 11, color: '#94a3b8', fontWeight: '500', marginTop: 1 },
    institutionBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    institutionText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
    complaintBox: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 8, marginBottom: 8 },
    complaintLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 },
    complaintText: { fontSize: 13, color: '#334155', fontWeight: '500' },
    vitalsPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    dxList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
    dxTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#fee2e2' },
    dxLabel: { fontSize: 11, fontWeight: '800', color: '#991b1b' },
    dxLevel: { fontSize: 9, fontWeight: '700', color: '#ef4444', marginLeft: 6, textTransform: 'uppercase' },
    vitalTag: { fontSize: 11, fontWeight: '700', color: '#059669', backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    notesText: { fontSize: 12, color: '#64748b', fontStyle: 'italic' },
    rxDetails: { fontSize: 13, color: '#475569', fontWeight: '600' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    pending: { backgroundColor: '#fef3c7' },
    dispensed: { backgroundColor: '#d1fae5' },
    statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    pendingText: { color: '#d97706', fontSize: 12, fontWeight: '600', marginTop: 4 },
    dispensedText: { color: '#059669' },
    resBox: { marginTop: 8, padding: 8, backgroundColor: '#f8fafc', borderRadius: 8 },
    resVal: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    resRange: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
    ordered: { backgroundColor: '#f1f5f9' },
    collected: { backgroundColor: '#eff6ff' },
    processing: { backgroundColor: '#fff7ed' },
    completed: { backgroundColor: '#ecfdf5' },
    emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 14, fontStyle: 'italic', marginVertical: 20 },
});
