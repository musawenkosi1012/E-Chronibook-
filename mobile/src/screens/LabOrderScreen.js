import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Alert, ActivityIndicator, StatusBar, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

export default function LabOrderScreen({ route, navigation }) {
    const { patient, encounterId } = route.params;
    const { token } = useAuth();
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [indication, setIndication] = useState('');
    const [priority, setPriority] = useState('routine');
    const [loading, setLoading] = useState(false);
    const [fetchingTests, setFetchingTests] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/lab/tests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) setTests(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingTests(false);
            }
        };
        fetchTests();
    }, [token]);

    const submitOrder = async () => {
        if (!selectedTest) {
            Alert.alert('Required', 'Please select a lab test');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/lab/orders/create`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patient_id: patient.id,
                    encounter_id: encounterId || null,
                    test_name: selectedTest.test_name,
                    test_code: selectedTest.test_code,
                    clinical_indication: indication,
                    priority: priority
                })
            });
            if (res.ok) {
                Alert.alert('Success', 'Lab order created successfully', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to create order');
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.first_name} {patient.last_name}</Text>
                    <Text style={styles.patientMeta}>ID: {patient.national_id || patient.id}</Text>
                </View>

                <Text style={styles.sectionTitle}>SELECT LAB TEST</Text>
                {fetchingTests ? (
                    <ActivityIndicator color="#059669" style={{ marginVertical: 20 }} />
                ) : (
                    <View style={styles.testGrid}>
                        {tests.map(test => (
                            <TouchableOpacity
                                key={test.id}
                                style={[
                                    styles.testCard,
                                    selectedTest?.id === test.id && styles.selectedTest
                                ]}
                                onPress={() => setSelectedTest(test)}
                            >
                                <Text style={[
                                    styles.testName,
                                    selectedTest?.id === test.id && styles.selectedTestText
                                ]}>{test.test_name}</Text>
                                <Text style={styles.testCategory}>{test.category}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.sectionTitle}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                    {['routine', 'urgent', 'stat'].map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.priorityBtn, priority === p && styles.priorityBtnActive]}
                            onPress={() => setPriority(p)}
                        >
                            <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                                {p.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>CLINICAL INDICATION</Text>
                <TextInput
                    style={styles.textArea}
                    value={indication}
                    onChangeText={setIndication}
                    placeholder="Reason for ordering this test..."
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity style={styles.submitBtn} onPress={submitOrder} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>SUBMIT ORDER</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    patientInfo: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    patientName: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
    patientMeta: { fontSize: 13, color: '#64748b', marginTop: 2 },
    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 12, marginTop: 10 },
    testGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    testCard: { width: '48%', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    selectedTest: { borderColor: '#8b5cf6', backgroundColor: '#f5f3ff' },
    testName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    selectedTestText: { color: '#7c3aed' },
    testCategory: { fontSize: 10, color: '#94a3b8', marginTop: 4, textTransform: 'uppercase' },
    priorityRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
    priorityBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#fff' },
    priorityBtnActive: { backgroundColor: '#1e293b', borderColor: '#1e293b' },
    priorityText: { fontSize: 12, fontWeight: '800', color: '#64748b' },
    priorityTextActive: { color: '#fff' },
    textArea: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', textAlignVertical: 'top', height: 100 },
    submitBtn: { backgroundColor: '#8b5cf6', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
    submitText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
});
