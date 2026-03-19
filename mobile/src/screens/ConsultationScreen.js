import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, Alert, ActivityIndicator, StatusBar, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

const VITAL_FIELDS = [
    { key: 'systolic_bp', label: 'Systolic', unit: 'mmHg' },
    { key: 'diastolic_bp', label: 'Diastolic', unit: 'mmHg' },
    { key: 'heart_rate', label: 'HR', unit: 'bpm' },
    { key: 'temperature', label: 'Temp', unit: '°C' },
    { key: 'spo2', label: 'SpO2', unit: '%' },
    { key: 'blood_glucose', label: 'Glucose', unit: 'mmol/L' },
];

export default function ConsultationScreen({ route, navigation }) {
    const { patient } = route.params;
    const { token } = useAuth();
    const [vitals, setVitals] = useState({});
    const [complaint, setComplaint] = useState('');
    const [notes, setNotes] = useState('');
    const [diagnoses, setDiagnoses] = useState([]);
    const [newDx, setNewDx] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [newRx, setNewRx] = useState({ name: '', dose: '', freq: '', duration: '' });
    const [loading, setLoading] = useState(false);

    const addDiagnosis = () => {
        if (!newDx.trim()) return;
        setDiagnoses([...diagnoses, { description: newDx.trim(), severity: 'moderate' }]);
        setNewDx('');
    };

    const addPrescription = () => {
        if (!newRx.name.trim()) return;
        setPrescriptions([...prescriptions, { ...newRx }]);
        setNewRx({ name: '', dose: '', freq: '', duration: '' });
    };

    const saveConsultation = async () => {
        if (!complaint.trim()) {
            Alert.alert('Required', 'Please enter chief complaint');
            return;
        }
        setLoading(true);
        try {
            // 1. Create Encounter
            const encounterBody = {
                patient_id: patient.id,
                encounter_type: 'outpatient',
                chief_complaint: complaint,
                clinical_notes: notes,
                vitals: Object.keys(vitals).length > 0 ? Object.fromEntries(
                    Object.entries(vitals).map(([k, v]) => [k, parseFloat(v)])
                ) : null,
                diagnoses: diagnoses
            };

            const encRes = await fetch(`${API_BASE}/api/encounters/create`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(encounterBody),
            });

            if (!encRes.ok) throw new Error('Failed to save encounter');
            const encounter = await encRes.json();

            // 2. Create Prescriptions if any
            for (const rx of prescriptions) {
                await fetch(`${API_BASE}/api/pharmacy/prescriptions/create`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        patient_id: patient.id,
                        encounter_id: encounter.id,
                        medication_name: rx.name,
                        dosage: rx.dose,
                        frequency: rx.freq,
                        duration: rx.duration
                    }),
                });
            }

            Alert.alert('Success', 'Consultation recorded successfully', [
                { text: 'OK', onPress: () => navigation.popToTop() }
            ]);
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
                    <Text style={styles.patientMeta}>{patient.gender} • ID: {patient.national_id || patient.id}</Text>
                </View>

                {/* Complaint & Notes */}
                <Text style={styles.sectionTitle}>CHIEF COMPLAINT *</Text>
                <TextInput
                    style={styles.textArea}
                    value={complaint}
                    onChangeText={setComplaint}
                    placeholder="Enter reason for visit..."
                    multiline
                />

                <Text style={styles.sectionTitle}>CLINICAL OBSERVATIONS</Text>
                <TextInput
                    style={[styles.textArea, { height: 80 }]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Physical exam results, history, etc..."
                    multiline
                />

                {/* Vitals Grid */}
                <Text style={styles.sectionTitle}>VITALS</Text>
                <View style={styles.vitalsGrid}>
                    {VITAL_FIELDS.map(f => (
                        <View key={f.key} style={styles.vitalBox}>
                            <Text style={styles.vitalLabel}>{f.label} ({f.unit})</Text>
                            <TextInput
                                style={styles.vitalInput}
                                value={vitals[f.key] || ''}
                                onChangeText={(v) => setVitals({ ...vitals, [f.key]: v })}
                                keyboardType="decimal-pad"
                                placeholder="0.0"
                            />
                        </View>
                    ))}
                </View>

                {/* Diagnoses */}
                <Text style={styles.sectionTitle}>DIAGNOSES</Text>
                <View style={styles.addItemRow}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={newDx}
                        onChangeText={setNewDx}
                        placeholder="e.g. Hypertension, Malaria..."
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={addDiagnosis}>
                        <Ionicons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                {diagnoses.map((dx, idx) => (
                    <View key={idx} style={styles.listCard}>
                        <Ionicons name="pulse" size={16} color="#ef4444" />
                        <Text style={styles.listText}>{dx.description}</Text>
                        <TouchableOpacity onPress={() => setDiagnoses(diagnoses.filter((_, i) => i !== idx))}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Prescriptions */}
                <Text style={styles.sectionTitle}>PRESCRIPTIONS</Text>
                <View style={styles.rxForm}>
                    <TextInput
                        style={styles.input}
                        value={newRx.name}
                        onChangeText={v => setNewRx({ ...newRx, name: v })}
                        placeholder="Medication name..."
                    />
                    <View style={styles.row}>
                        <TextInput style={[styles.input, { flex: 1 }]} value={newRx.dose} onChangeText={v => setNewRx({ ...newRx, dose: v })} placeholder="Dose (v.g. 5mg)" />
                        <TextInput style={[styles.input, { flex: 1 }]} value={newRx.freq} onChangeText={v => setNewRx({ ...newRx, freq: v })} placeholder="Freq (v.g. OD)" />
                        <TextInput style={[styles.input, { flex: 1 }]} value={newRx.duration} onChangeText={v => setNewRx({ ...newRx, duration: v })} placeholder="Duration" />
                    </View>
                    <TouchableOpacity style={styles.rxAddBtn} onPress={addPrescription}>
                        <Text style={styles.rxAddText}>ADD MEDICATION</Text>
                    </TouchableOpacity>
                </View>
                {prescriptions.map((rx, idx) => (
                    <View key={idx} style={styles.listCard}>
                        <Ionicons name="pill" size={16} color="#059669" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.listText}>{rx.name}</Text>
                            <Text style={styles.listSubText}>{rx.dose} • {rx.freq} • {rx.duration}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.submitBtn} onPress={saveConsultation} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>COMPLETE CONSULTATION</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { padding: 16, paddingBottom: 60 },
    patientInfo: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 16, marginBottom: 20 },
    patientName: { fontSize: 22, fontWeight: '900', color: '#1e293b' },
    patientMeta: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '600' },
    sectionTitle: { fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginBottom: 10, marginTop: 15 },
    textArea: { backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15, textAlignVertical: 'top', height: 60 },
    vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    vitalBox: { width: '31%', backgroundColor: '#fff', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    vitalLabel: { fontSize: 9, fontWeight: '800', color: '#64748b', marginBottom: 4 },
    vitalInput: { fontSize: 14, fontWeight: '700', color: '#1e293b', padding: 0 },
    input: { backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 14 },
    addItemRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    addBtn: { backgroundColor: '#1e293b', width: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    listCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    listText: { fontSize: 14, fontWeight: '700', color: '#1e293b', flex: 1 },
    listSubText: { fontSize: 11, color: '#64748b', marginTop: 1 },
    rxForm: { backgroundColor: '#fff', p: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', p: 12, gap: 10, marginBottom: 10 },
    row: { flexDirection: 'row', gap: 8 },
    rxAddBtn: { backgroundColor: '#ecfdf5', padding: 10, borderRadius: 8, alignItems: 'center' },
    rxAddText: { fontSize: 11, fontWeight: '800', color: '#059669' },
    submitBtn: { backgroundColor: '#005a30', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 30 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
});
