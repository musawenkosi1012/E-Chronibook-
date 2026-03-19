import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import API_BASE from '../config';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Login failed');
            await login(data.access_token, data.user);
        } catch (err) {
            Alert.alert('Authentication Failed', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#005a30" />
            <View style={styles.header}>
                <View style={styles.iconBg}>
                    <Ionicons name="heart-circle" size={40} color="#fff" />
                </View>
                <Text style={styles.title}>E-ChroniBook</Text>
                <Text style={styles.subtitle}>National EMR Mobile</Text>
            </View>

            <KeyboardAvoidingView
                style={styles.form}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <Text style={styles.formTitle}>Staff Sign In</Text>
                <Text style={styles.formSubtitle}>Enter your credentials to access clinical tools</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>EMAIL ADDRESS</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="mail-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="e.g. dr.j.doe@hospital.gov.zw"
                            placeholderTextColor="#94a3b8"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="••••••••••••"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                            <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.loginBtnText}>AUTHENTICATE</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.secureRow}>
                    <Ionicons name="shield-checkmark" size={16} color="#059669" />
                    <Text style={styles.secureText}>Secure 256-bit Connection</Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: {
        backgroundColor: '#005a30',
        paddingTop: 60, paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    iconBg: {
        width: 64, height: 64, borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    },
    title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginTop: 4 },
    form: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
    formTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    formSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 28, fontWeight: '500' },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1, marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#f1f5f9', borderRadius: 12,
        borderWidth: 1, borderColor: '#e2e8f0',
    },
    inputIcon: { paddingLeft: 14 },
    input: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    eyeBtn: { paddingRight: 14 },
    loginBtn: {
        backgroundColor: '#007b46',
        paddingVertical: 16, borderRadius: 14,
        flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
        marginTop: 12,
        shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
        elevation: 6,
    },
    loginBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
    secureRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 },
    secureText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
});
