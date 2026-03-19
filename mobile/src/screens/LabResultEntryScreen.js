import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Alert, ActivityIndicator, StatusBar, Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

export default function LabResultEntryScreen({ route, navigation }) {
    const { order } = route.params;
    const { token } = useAuth();
    const [result, setResult] = useState('');
    const [unit, setUnit] = useState('');
    const [reference, setReference] = useState('');
    const [isAbnormal, setIsAbnormal] = useState(false);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const submitResult = async () => {
        if (!result) {
            Alert.alert('Required', 'Please enter the result value');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/lab/results/${order.id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    result_value: result,
                    unit: unit,
                    reference_range: reference,
                    is_abnormal: isAbnormal ? 'abnormal' : 'normal',
                    notes: notes
                })
            });
            if (res.ok) {
                Alert.alert('Success', 'Lab results submitted', [
                    { text: 'OK', onPress: () => navigation.popToTop() }
                ]);
            } else {
                throw new Error('Failed to submit results');
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
                <View style={styles.orderSummary}>
                    <Text style={styles.testName}>{order.test_name}</Text>
                    <Text style={styles.orderMeta}>Order #{order.id} • Patient ID: {order.patient_id}</Text>
                    {order.clinical_indication ? (
                        <View style={styles.indicationBox}>
                            <Text style={styles.indicationLabel}>Indication</Text>
                            <Text style={styles.indicationText}>{order.clinical_indication}</Text>
                        </View>
                    ) : null}
                </View>

                <View style={styles.formRow}>
                    <View style={{ flex: 1.5 }}>
                        <Text style={styles.sectionTitle}>RESULT VALUE</Text>
                        <TextInput
                            style={styles.input}
                            value={result}
                            onChangeText={setResult}
                            placeholder="v.g. 5.2"
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sectionTitle}>UNIT</Text>
                        <TextInput
                            style={styles.input}
                            value={unit}
                            onChangeText={setUnit}
                            placeholder="mmol/L"
                        />
                    </View>
                </View>

                <Text style={styles.sectionTitle}>REFERENCE RANGE</Text>
                <TextInput
                    style={styles.input}
                    value={reference}
                    onChangeText={setReference}
                    placeholder="v.g. 3.9 - 6.1"
                />

                <View style={styles.abnormalRow}>
                    <Text style={styles.abnormalLabel}>Flag as Abnormal?</Text>
                    <Switch
                        value={isAbnormal}
                        onValueChange={setIsAbnormal}
                        trackColor={{ true: '#f43f5e', false: '#e2e8f0' }}
                        thumbColor={isAbnormal ? '#fff' : '#fff'}
                    />
                </View>

                <Text style={styles.sectionTitle}>TECHNICIAN NOTES</Text>
                <TextInput
                    style={styles.textArea}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Observations, calibration notes..."
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity style={styles.submitBtn} onPress={submitResult} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>COMPLETE ORDER</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { padding: 16, paddingBottom: 40 },
    orderSummary: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#e2e8f0' },
    testName: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
    orderMeta: { fontSize: 13, color: '#94a3b8', marginTop: 4, fontWeight: '600' },
    indicationBox: { marginTop: 12, padding: 10, backgroundColor: '#f8fafc', borderRadius: 10 },
    indicationLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
    indicationText: { fontSize: 13, color: '#475569', marginTop: 2, fontWeight: '500' },
    formRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1, marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 16, fontWeight: '700' },
    abnormalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginVertical: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    abnormalLabel: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    textArea: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', textAlignVertical: 'top', height: 100 },
    submitBtn: { backgroundColor: '#059669', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
    submitText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
});
