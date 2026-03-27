'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { createSession, verifySession } from '@/lib/auth';
import { cookies } from 'next/headers';

// --- TYPES ---
export interface Ward extends RowDataPacket {
    id: number;
    name: string;
    ward_type: string;
    current_available_beds: number;
    hospital_name: string;
}

export interface BookingRequest extends RowDataPacket {
    id: number;
    patient_name: string;
    severity_score: number;
    ward_id: number;
    ward_name: string;
    request_time: string;
    status: string;
}

// --- AUTHENTICATION ---
export async function registerUser(formData: FormData) {
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    
    // SECURITY FIX: Hardcode role to 'user'. 
    const role = 'user'; 

    if (!name || !email || !password) return { error: "Missing fields" };

    const hashedPassword = await bcrypt.hash(password, 10);
    let success = false;

    try {
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role]
        );
        success = true;
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') return { error: "Email already exists" };
        return { error: error.message };
    }

    if (success) {
        redirect('/login');
    }
}

export async function loginUser(formData: FormData) {
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();

    if (!email || !password) return { error: "Missing credentials" };

    let redirectPath = '';

    try {
        const [users] = await pool.query<RowDataPacket[]>(`SELECT * FROM users WHERE email = ?`, [email]);
        if (users.length === 0) return { error: "Invalid credentials" };

        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return { error: "Invalid credentials" };

        await createSession(user.id, user.role);
        redirectPath = user.role === 'admin' ? '/admin' : '/portal';
        
    } catch (error: any) {
        return { error: "Database connection failed." };
    }

    if (redirectPath) {
        redirect(redirectPath);
    }
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    redirect('/login');
}

// --- PUBLIC PORTAL ACTIONS ---
export async function getDashboardData(): Promise<Ward[]> {
    const [wards] = await pool.query<Ward[]>(`
        SELECT w.id, w.name, w.ward_type, w.current_available_beds, h.name as hospital_name 
        FROM icu_wards w 
        JOIN hospitals h ON w.hospital_id = h.id
    `);
    return wards;
}

export async function submitBookingRequest(formData: FormData): Promise<{ success: boolean; message: string }> {
    const session = await verifySession();
    if (!session) return { success: false, message: "Unauthorized. You must be logged in." };

    const patientName = formData.get('patientName')?.toString();
    const severityScore = parseInt(formData.get('severityScore')?.toString() || '0', 10);
    const wardId = parseInt(formData.get('wardId')?.toString() || '0', 10);

    if (!patientName || !severityScore || !wardId) return { success: false, message: "Invalid input" };

    try {
        await pool.query(
            `INSERT INTO booking_requests (patient_name, severity_score, ward_id) VALUES (?, ?, ?)`,
            [patientName, severityScore, wardId]
        );
        revalidatePath('/portal');
        return { success: true, message: "Request submitted to admin queue." };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// --- ADMIN COMMAND CENTER ACTIONS ---
export async function getPendingRequests(): Promise<BookingRequest[]> {
    const [requests] = await pool.query<BookingRequest[]>(`
        SELECT r.id, r.patient_name, r.severity_score, r.ward_id, r.request_time, r.status, w.name as ward_name
        FROM booking_requests r
        JOIN icu_wards w ON r.ward_id = w.id
        WHERE r.status = 'Pending'
        ORDER BY r.severity_score DESC, r.request_time ASC
    `);
    return requests;
}

export async function getActiveAdmissions(): Promise<any[]> {
    const [admissions] = await pool.query(`
        SELECT a.id, p.name as patient_name, w.name as ward_name, b.id as bed_id, a.admission_time 
        FROM admissions a
        JOIN patients p ON a.patient_id = p.id
        JOIN beds b ON a.bed_id = b.id
        JOIN icu_wards w ON b.ward_id = w.id
        WHERE a.status = 'Active'
    `);
    return admissions as any[];
}

export async function approveRequest(requestId: number, wardId: number, patientName: string, severityScore: number): Promise<{ success: boolean; message: string }> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [beds] = await connection.query<RowDataPacket[]>(
            `SELECT id FROM beds WHERE ward_id = ? AND status = 'Available' LIMIT 1 FOR UPDATE`,
            [wardId]
        );
        if (beds.length === 0) throw new Error("No beds available at this moment.");
        const bedId = beds[0].id;

        const [equipment] = await connection.query<RowDataPacket[]>(
            `SELECT e.id FROM equipment e JOIN icu_wards w ON e.hospital_id = w.hospital_id 
             WHERE w.id = ? AND e.type = 'Ventilator' AND e.status = 'Available' LIMIT 1 FOR UPDATE`,
            [wardId]
        );
        if (equipment.length === 0) throw new Error("No ventilators available.");
        const ventId = equipment[0].id;

        const [patientResult] = await connection.query<ResultSetHeader>(
            `INSERT INTO patients (name, severity_score) VALUES (?, ?)`,
            [patientName, severityScore]
        );
        const patientId = patientResult.insertId;

        await connection.query(`UPDATE beds SET status = 'Occupied' WHERE id = ?`, [bedId]);
        await connection.query(`UPDATE equipment SET status = 'In_Use' WHERE id = ?`, [ventId]);
        
        const [admission] = await connection.query<ResultSetHeader>(
            `INSERT INTO admissions (patient_id, bed_id) VALUES (?, ?)`, 
            [patientId, bedId]
        );
        
        await connection.query(`INSERT INTO admission_equipment (admission_id, equipment_id) VALUES (?, ?)`, [admission.insertId, ventId]);
        await connection.query(`UPDATE booking_requests SET status = 'Approved' WHERE id = ?`, [requestId]);

        await connection.commit();
        revalidatePath('/admin');
        revalidatePath('/portal');
        return { success: true, message: "Request approved and resources allocated." };
    } catch (error: any) {
        await connection.rollback();
        return { success: false, message: error.message };
    } finally {
        connection.release();
    }
}

export async function rejectRequest(requestId: number) {
    await pool.query(`UPDATE booking_requests SET status = 'Rejected' WHERE id = ?`, [requestId]);
    revalidatePath('/admin');
}

export async function dischargePatient(admissionId: number): Promise<{ success: boolean; message: string }> {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const [admission] = await connection.query<RowDataPacket[]>(
            `SELECT bed_id FROM admissions WHERE id = ? FOR UPDATE`, [admissionId]
        );
        const bedId = admission[0].bed_id;

        const [equipment] = await connection.query<RowDataPacket[]>(
            `SELECT equipment_id FROM admission_equipment WHERE admission_id = ? FOR UPDATE`, [admissionId]
        );

        await connection.query(`UPDATE beds SET status = 'Cleaning' WHERE id = ?`, [bedId]);
        
        if (equipment.length > 0) {
            for (const eq of equipment) {
                await connection.query(`UPDATE equipment SET status = 'Available' WHERE id = ?`, [eq.equipment_id]);
            }
        }

        await connection.query(`UPDATE admissions SET status = 'Discharged' WHERE id = ?`, [admissionId]);
        await connection.query(`UPDATE beds SET status = 'Available' WHERE id = ?`, [bedId]);

        await connection.commit();
        revalidatePath('/admin');
        revalidatePath('/portal');
        return { success: true, message: "Patient discharged. Bed and equipment freed." };
    } catch (error: any) {
        await connection.rollback();
        return { success: false, message: error.message };
    } finally {
        connection.release();
    }
}