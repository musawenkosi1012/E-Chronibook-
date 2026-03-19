import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, FlatList, StyleSheet, ActivityIndicator,
    StatusBar, TouchableOpacity, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

export default function LabTechDashboardScreen({ navigation }) {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadOrders = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/lab/orders/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) setOrders(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    useEffect(() => { loadOrders(); }, [loadOrders]);

    const renderOrder = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('LabResultEntry', { order: item })}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.priorityBadge, styles[item.priority] || styles.routine]}>
                    <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
                </View>
                <Text style={styles.orderId}>ORDER #{item.id}</Text>
            </View>
            <Text style={styles.testName}>{item.test_name}</Text>
            <Text style={styles.patientName}>Patient ID: {item.patient_id}</Text>
            <View style={styles.cardFooter}>
                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                <Text style={styles.footerText}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadOrders(); }} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="flask-outline" size={64} color="#e2e8f0" />
                        <Text style={styles.emptyText}>No pending laboratory orders.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    list: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    priorityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    stat: { backgroundColor: '#fef2f2' },
    urgent: { backgroundColor: '#fff7ed' },
    routine: { backgroundColor: '#f0fdf4' },
    priorityText: { fontSize: 10, fontWeight: '800' },
    orderId: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },
    testName: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    patientName: { fontSize: 13, color: '#64748b', marginTop: 4 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    footerText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    empty: { flex: 1, alignItems: 'center', marginTop: 100 },
    emptyText: { color: '#94a3b8', fontSize: 15, fontWeight: '600', marginTop: 12 },
});
