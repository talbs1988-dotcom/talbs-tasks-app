---
name: tasks-app-install
description: "התקנת אפליקציית המשימות האישית מסדנת טל בשור. שכפול מ-GitHub, פריסה ל-Vercel, ושאלה אם לחבר CRM (Airtable / Notion / ללא). השתמש כשמשתתף אומר 'תתקין לי את האפליקציה', 'אני רוצה את אפליקציית המשימות של טל', 'install tasks app', או כשמדביקים https://github.com/talbs1988-dotcom/talbs-tasks-app"
---

# התקנת אפליקציית המשימות

אפליקציה אישית בסגנון WhatsApp לניהול משימות עם תת-משימות.
עובדת **גם ללא CRM** — שומרת בדפדפן (localStorage).
אופציונלי: חיבור ל-Airtable לשמירה בענן.

---

## שלב 1 — שיבוט ה-repo

```bash
cd ~
git clone https://github.com/talbs1988-dotcom/talbs-tasks-app
cd talbs-tasks-app
```

## שלב 2 — שאל אם רוצה CRM

**שאל שאלה אחת:**

> "האם תרצה לשמור את המשימות בענן (Airtable), או שמספיק לך שישמר בדפדפן?"

- **ללא CRM** → עבור ישר לשלב 3 (פריסה בלי משתני סביבה)
- **Airtable** → המשך לשלב 2א

### שלב 2א — הגדרת Airtable (רק אם בחרו)

1. היכנס ל-https://airtable.com ← צור Base חדש בשם "המשימות שלי"
2. צור טבלה בשם `משימות` עם השדות:
   - **משימה** — Single line text
   - **סטטוס** — Single select: `פתוח`, `סגור`
   - **הערות** — Long text
   - **תאריך יצירה** — Created time
3. מה-URL של הבסיס — קח את ה-Base ID: `appXXXXXXXXXXXXXX`
4. צור Personal Access Token: https://airtable.com/create/tokens
   - Scopes: `data.records:read`, `data.records:write`
   - Access: הבסיס שיצרת

## שלב 3 — פריסה ל-Vercel

### אם אין חשבון Vercel:

1. היכנס ל-https://vercel.com ← Sign Up (אפשר עם GitHub)
2. זה בחינם לגמרי

### אם אין Vercel CLI:

```bash
npm install -g vercel
```

> אם מופיעה שגיאה על `npm` — יש להתקין תחילה Node.js מ-https://nodejs.org (גרסת LTS)

### פריסה:

```bash
vercel --prod
```

- יבקש לעשות login בדפדפן ← אשר
- ישאל שם הפרויקט ← Enter לאישור ברירת המחדל
- בסוף יציג URL — זה האפליקציה שלך

### אם בחרו Airtable — הוסף משתני סביבה:

```bash
vercel env add AIRTABLE_PAT       # הטוקן מ-2א
vercel env add AIRTABLE_BASE_ID   # appXXXX...

# פרוס מחדש:
vercel --prod
```

## שלב 4 — בדיקה

פתח את ה-URL שקיבלת מ-Vercel ← הוסף משימה ← ודא שנשמרת.

---

## פתרון בעיות

| בעיה                  | פתרון                                    |
| --------------------- | ---------------------------------------- |
| משימות נעלמות בריענון | בחרת "ללא CRM" — זה נורמלי, צור Airtable |
| שגיאה 401             | הטוקן לא נכון ב-Vercel env               |
| שדות לא נמצאים        | ודא שמות השדות זהים בעברית בדיוק         |
