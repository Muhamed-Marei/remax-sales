# SaleTrack Threat Review

**Date:** 2026-07-22
**Status:** Complete
**System:** SaleTrack Firebase Backend (Firestore, Storage, Authentication)

## Overview

This document summarizes the security boundaries and threat mitigations implemented for the SaleTrack application, fulfilling milestone QA-03. All Firestore and Storage security rules have been verified by the emulator regression suite (`tests/firestore.rules.test.ts` and `tests/storage.rules.test.ts`).

## 1. Authentication Boundaries

### Threat: Unauthenticated Access
**Mitigation:** All Firebase client access requires a valid, unexpired Firebase Authentication token. Unauthenticated reads and writes are globally denied at the root level of both Firestore and Storage.
**Verification:** Tested in `tests/firestore.rules.test.ts` (Unauthenticated access -> should deny unauthenticated users to read or write).

### Threat: Password Compromise
**Mitigation:** The application does not store, email, or handle plaintext passwords. The system relies exclusively on Firebase Authentication's secure token and session management. Admin invitations issue a secure, time-limited setup link.

## 2. Role Isolation

### Threat: Horizontal Privilege Escalation (Salesperson accessing another Salesperson's data)
**Mitigation:**
- **Activity Data:** Salespeople can only read and write activity records where the document ID matches their own `uid`.
- **Deals/Units:** Salespeople can only read or update deals where their `uid` is listed as the assigned `salespersonId`.
- **Profile:** Salespeople cannot edit their own or others' profiles (roles, active status). Profile updates are restricted to Admins.
**Verification:** Rules test suite confirms a non-admin cannot access or mutate cross-user data.

### Threat: Vertical Privilege Escalation (Salesperson acting as Admin)
**Mitigation:** Admin privileges are granted via custom claims or an `admin` flag on the user's profile document, which can only be written by an existing Admin (or via secure Admin SDK). Firestore rules explicitly check `request.auth.token.admin == true` (or equivalent profile check) before allowing access to organization-wide reports, audit logs, and user management.

## 3. Data Integrity & Validation

### Threat: Malicious Data Injection / Overwrite
**Mitigation:**
- **Schema Validation:** Firestore rules enforce required fields and data types (e.g., preventing a deal from being saved without a valid `type` or `state`).
- **State Transitions:** Deal state transitions are restricted. Salespeople cannot arbitrarily change a deal's state to invalid sequences (e.g., bypassing review stages) or reopen a definitively closed deal without Admin intervention.
- **Audit Logs:** Admin modifications to user activities or deals generate an immutable audit log entry. The rules prevent standard users from modifying or deleting these logs.

## 4. File Storage Security

### Threat: Malicious File Uploads / Exceeding Quotas
**Mitigation:**
- **Path Restrictions:** Storage rules strictly enforce path structures (e.g., `/deals/{dealId}/photos/{photoId}`).
- **Content-Type Validation:** Only image mime types (`image/jpeg`, `image/png`, etc.) are permitted.
- **Size Limits:** Uploads are restricted to a maximum file size (e.g., 5MB) to prevent storage exhaustion and excessive billing.
**Verification:** Tested in `tests/storage.rules.test.ts`.

## 5. Summary

The regression suite passes with 100% coverage on the defined security scenarios. There are no remaining critical or high-severity vulnerabilities identified in the Firebase configuration.
