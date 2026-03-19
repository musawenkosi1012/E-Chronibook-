import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet, ActivityIndicator,
    StatusBar, Dimensions, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

const { width } = Dimensions.get('window');

export default function AnalyticsDashboardScreen() {
    const { token, user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAnalytics = useCallback(async () => {
        try {
            const isNational = ['national_super_user', 'ministry_official'].includes(user?.role);
            const endpoint = isNational
                ? `${API_BASE}/api/analytics/national/overview`
                : `${API_BASE}/api/analytics/institution/${user.institution_id}/summary`;

            const res = await fetch(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const overview = await res.json();

            if (isNational) {
                const burdenRes = await fetch(`${API_BASE}/api/analytics/national/ncd-burden`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                overview.ncdBurden = await burdenRes.json();
            }

            setData(overview);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, user]);

    useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

    const StatCard = ({ label, value, icon, color }) => (
        <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={styles.statVal}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    if (loading && !refreshing) return (
        <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAnalytics(); }} />}
            >
                <Text style={styles.title}>System Overview</Text>
                <View style={styles.grid}>
                    <StatCard label="Total Patients" value={data?.total_patients} icon="people" color="#059669" />
                    <StatCard label="Encounters" value={data?.total_encounters} icon="medical" color="#2563eb" />
                    <StatCard label="Staff Members" value={data?.total_staff} icon="ribbon" color="#d97706" />
                    <StatCard label="Facilities" value={data?.total_facilities} icon="business" color="#6366f1" />
                </View>

                {data?.ncdBurden && (
                    <>
                        <Text style={styles.sectionTitle}>NCD Burden (National Rates)</Text>
                        <View style={styles.burdenRow}>
                            <View style={styles.burdenCard}>
                                <Text style={styles.burdenRate}>{data.ncdBurden.hypertension_rate}%</Text>
                                <Text style={styles.burdenLabel}>Hypertension</Text>
                                <View style={styles.progressBar}><View style={[styles.progress, { width: `${data.ncdBurden.hypertension_rate}%`, backgroundColor: '#ef4444' }]} /></View>
                            </View>
                            <View style={styles.burdenCard}>
                                <Text style={styles.burdenRate}>{data.ncdBurden.diabetes_rate}%</Text>
                                <Text style={styles.burdenLabel}>Diabetes</Text>
                                <View style={styles.progressBar}><View style={[styles.progress, { width: `${data.ncdBurden.diabetes_rate}%`, backgroundColor: '#f97316' }]} /></View>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>Top Reported Diagnoses</Text>
                        <View style={styles.list}>
                            {data.ncdBurden.top_diagnoses.map((dx, i) => (
                                <View key={i} style={styles.listItem}>
                                    <Text style={styles.listIdx}>#{i + 1}</Text>
                                    <Text style={styles.listName}>{dx.name}</Text>
                                    <Text style={styles.listCount}>{dx.count}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {user.role === 'institution_it_admin' && (
                    <View style={styles.instCard}>
                        <Text style={styles.instTitle}>Facility Status</Text>
                        <View style={styles.instRow}>
                            <View>
                                <Text style={styles.instLabel}>Pending Labs</Text>
                                <Text style={styles.instVal}>{data?.pending_lab_orders || 0}</Text>
                            </View>
                            <View>
                                <Text style={styles.instLabel}>Pending Rx</Text>
                                <Text style={styles.instVal}>{data?.pending_prescriptions || 0}</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: 16 },
    title: { fontSize: 20, fontWeight: '900', color: '#1e293b', marginBottom: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { width: (width - 44) / 2, backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statVal: { fontSize: 22, fontWeight: '900', color: '#1e293b' },
    statLabel: { fontSize: 12, color: '#64748b', fontWeight: '600', marginTop: 2 },
    sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94a3b8', letterSpacing: 1, marginTop: 28, marginBottom: 16 },
    burdenRow: { flexDirection: 'row', gap: 12 },
    burdenCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    burdenRate: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    burdenLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', marginVertical: 4 },
    progressBar: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginTop: 8 },
    progress: { height: '100%', borderRadius: 3 },
    list: { backgroundColor: '#fff', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    listIdx: { width: 28, fontSize: 12, fontWeight: '800', color: '#94a3b8' },
    listName: { flex: 1, fontSize: 13, fontWeight: '700', color: '#334155' },
    listCount: { fontSize: 12, fontWeight: '800', color: '#2563eb' },
    instCard: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, marginTop: 24 },
    instTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
    instRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    instLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    instVal: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
});
