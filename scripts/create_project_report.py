from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile, ZIP_DEFLATED
import re
import html
import xml.etree.ElementTree as ET
from lxml import etree as LET

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
FRONT = DOCS / 'FRONT PAGE TO STUDENTS (1).docx'
OUTPUT = ROOT / 'FrenchBell_Cafe_Management_System_Project_Report.docx'
NAVY = '213547'
GOLD = 'C99A42'
PALE = 'F4F1EA'
GRAY = '667085'

def set_cell_shading(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = tcPr.find(qn('w:shd'))
    if shd is None:
        shd = OxmlElement('w:shd'); tcPr.append(shd)
    shd.set(qn('w:fill'), fill)

def set_cell_margins(cell, top=100, start=110, bottom=100, end=110):
    tc = cell._tc; tcPr = tc.get_or_add_tcPr()
    tcMar = tcPr.first_child_found_in('w:tcMar')
    if tcMar is None:
        tcMar = OxmlElement('w:tcMar'); tcPr.append(tcMar)
    for m, v in [('top',top),('start',start),('bottom',bottom),('end',end)]:
        el = tcMar.find(qn('w:'+m))
        if el is None: el=OxmlElement('w:'+m); tcMar.append(el)
        el.set(qn('w:w'),str(v)); el.set(qn('w:type'),'dxa')

def set_repeat_table_header(row):
    trPr=row._tr.get_or_add_trPr(); rep=OxmlElement('w:tblHeader'); rep.set(qn('w:val'),'true'); trPr.append(rep)

def field(run, code):
    begin=OxmlElement('w:fldChar'); begin.set(qn('w:fldCharType'),'begin')
    ins=OxmlElement('w:instrText'); ins.set(qn('xml:space'),'preserve'); ins.text=code
    sep=OxmlElement('w:fldChar'); sep.set(qn('w:fldCharType'),'separate')
    txt=OxmlElement('w:t'); txt.text='1'
    end=OxmlElement('w:fldChar'); end.set(qn('w:fldCharType'),'end')
    for e in (begin,ins,sep,txt,end): run._r.append(e)

def set_run_font(run, size=12, bold=None, color=None, italic=None):
    run.font.name='Times New Roman'; run._element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman')
    run.font.size=Pt(size)
    if bold is not None: run.bold=bold
    if italic is not None: run.italic=italic
    if color: run.font.color.rgb=RGBColor.from_string(color)

def setup_doc():
    doc=Document()
    sec=doc.sections[0]
    sec.top_margin=Inches(1); sec.bottom_margin=Inches(1); sec.left_margin=Inches(1); sec.right_margin=Inches(1)
    sec.footer_distance=Inches(.5); sec.header_distance=Inches(.5)
    styles=doc.styles
    normal=styles['Normal']; normal.font.name='Times New Roman'; normal._element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman'); normal.font.size=Pt(12)
    normal.paragraph_format.line_spacing=1.5; normal.paragraph_format.alignment=WD_ALIGN_PARAGRAPH.JUSTIFY; normal.paragraph_format.space_after=Pt(6)
    for nm,size in [('Title',20),('Heading 1',14),('Heading 2',12),('Heading 3',12)]:
        st=styles[nm]; st.font.name='Times New Roman'; st._element.rPr.rFonts.set(qn('w:eastAsia'),'Times New Roman'); st.font.size=Pt(size); st.font.bold=True; st.font.color.rgb=RGBColor.from_string(NAVY); st.paragraph_format.keep_with_next=True
        if nm=='Heading 1': st.paragraph_format.space_before=Pt(15); st.paragraph_format.space_after=Pt(8)
    footer=sec.footer.paragraphs[0]; footer.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=footer.add_run(); set_run_font(r,10,color=GRAY); field(r,'PAGE')
    return doc

def add_page(doc): doc.add_page_break()

def title(doc, text, level=1):
    p=doc.add_paragraph(style=f'Heading {level}'); p.paragraph_format.keep_with_next=True
    p.add_run(text); return p

def para(doc, text, boldlead=None):
    p=doc.add_paragraph()
    if boldlead and text.startswith(boldlead):
        set_run_font(p.add_run(boldlead),bold=True); p.add_run(text[len(boldlead):])
    else: p.add_run(text)
    return p

def bullet(doc,text):
    p=doc.add_paragraph(style='List Bullet'); p.paragraph_format.line_spacing=1.3; p.add_run(text); return p

def table(doc, headers, rows, widths=None, font_size=10):
    t=doc.add_table(rows=1, cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.style='Table Grid'; t.autofit=False
    set_repeat_table_header(t.rows[0])
    for j,h in enumerate(headers):
        c=t.rows[0].cells[j]; set_cell_shading(c,NAVY); set_cell_margins(c); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p=c.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.LEFT; p.paragraph_format.space_after=Pt(0); p.paragraph_format.line_spacing=1.0
        set_run_font(p.add_run(str(h)),font_size,bold=True,color='FFFFFF')
    for i,row in enumerate(rows):
        cells=t.add_row().cells
        for j,val in enumerate(row):
            c=cells[j]; c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER; set_cell_margins(c)
            if i%2==1: set_cell_shading(c,'F5F7FA')
            p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(0); p.paragraph_format.line_spacing=1.0
            set_run_font(p.add_run(str(val)),font_size,color='202124')
    if widths:
        for row in t.rows:
            for j,w in enumerate(widths): row.cells[j].width=Inches(w)
    doc.add_paragraph().paragraph_format.space_after=Pt(1)
    return t

def caption(doc, text):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.keep_with_next=False; p.paragraph_format.space_after=Pt(9)
    set_run_font(p.add_run(text),10,bold=True,color=NAVY)

def import_front_matter(doc):
    # Keep the student-supplied Word document's page design and institutional images intact,
    # while replacing only student-fillable details and the project title.
    with ZipFile(FRONT) as z:
        root=LET.fromstring(z.read('word/document.xml'))
        ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        replacements={
            '“Project Title”':'FrenchBell Cafe Management System',
            '“Project title”':'FrenchBell Cafe Management System',
            '<Candidate Name_1>':'[Candidate Name 1]', '<Candidate Reg no_1>':'[Register Number 1]',
            '<Candidate Name_2>':'[Candidate Name 2]', '<Candidate Reg no_2>':'[Register Number 2]',
            '<Guide Name>':'[Project Guide Name]', 'Candidate name':'[Candidate Name]',
            'Candidate Reg. No.':'[Register Number]', 'Candidate Reg No.':'[Register Number]'
        }
        # Replace the fragmented names and paragraph run text safely, preserving all run formatting.
        for p in root.findall('.//w:p',ns):
            texts=p.findall('.//w:t',ns)
            if not texts: continue
            original=''.join(t.text or '' for t in texts)
            # remove inserted tab/property markup artifacts from candidate paragraphs by assigning clean fill-ins.
            if 'Candidate Name_1' in original or 'Candidate Reg no_1' in original or 'Candidate Name_2' in original or 'Candidate Reg no_2' in original:
                continue
            new=original
            for old,repl in replacements.items(): new=new.replace(old,repl)
            if new != original:
                texts[0].text=new
                for t in texts[1:]: t.text=''
        # Candidate paragraphs contain malformed visible field text split across runs; normalize them.
        paragraphs=root.findall('.//w:p',ns)
        for p in paragraphs:
            text=''.join(t.text or '' for t in p.findall('.//w:t',ns))
            if 'Candidate Name_1' in text or 'Candidate Reg no_1' in text or 'Candidate Name_2' in text or 'Candidate Reg no_2' in text:
                ts=p.findall('.//w:t',ns)
                if ts:
                    ts[0].text='[Candidate Name]  |  [Register Number]'
                    for t in ts[1:]: t.text=''
        # Correct the certificate title and singular/plural placeholder without altering supplied wording.
        xml=ET.tostring(root,encoding='utf-8',xml_declaration=True).replace(b'[Register Number],,',b'[Register Number],')
        # Import main document body content in supplied order, excluding section properties.
        body=LET.fromstring(xml).find('w:body',ns)
        # Retain the supplied cover, certificate, and acknowledgement. The template's
        # following report outline is replaced by the complete generated report below.
        source_elements=[]
        for element in list(body):
            if element.tag.endswith('}sectPr'): continue
            if element.tag.endswith('}p'):
                text=''.join(element.itertext())
                if 'TABLE OF CONTENTS' in text:
                    break
            source_elements.append(element)
        for element in list(body):
            pass
        # Insert in source order before the section properties and before report content.
        insertion=0
        for element in source_elements:
            doc.element.body.insert(insertion,deepcopy(element)); insertion+=1
        # Copy referenced image relationships/media from the front page template.
        rels=LET.fromstring(z.read('word/_rels/document.xml.rels'))
        rid_to_image={}
        for rel in rels:
            target=rel.attrib.get('Target','')
            if target.startswith('media/'):
                rid_to_image[rel.attrib['Id']]=target
        # python-docx package relationship ids need remapping to copied image parts.
        for blip in doc.element.body.iter():
            if blip.tag.endswith('}blip'):
                rid=blip.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed')
                if rid in rid_to_image:
                    media_name=rid_to_image[rid]
                    data=z.read('word/'+media_name)
                    import io
                    part=doc.part.package.image_parts.get_or_add_image_part(io.BytesIO(data))
                    blip.set('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed',doc.part.relate_to(part,'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image'))
        # Create a section boundary after the supplied cover/certificate/acknowledgement pages.
        doc.add_section(WD_SECTION.NEW_PAGE)

def make_report(doc):
    title(doc,'ABSTRACT')
    para(doc,'FrenchBell Cafe Management System is a web-based platform for customer ordering and cafe operations. The project combines a responsive React customer interface with an Express.js REST API and a PostgreSQL relational database. Customers can explore the menu, select dine-in, takeaway, or delivery, customize items, apply offers, place orders, review receipts, and follow order progress. Administrators use a protected dashboard to handle incoming orders, menu and category data, customers, coupons, advertisements, settings, inventory information, receipts, payments, analytics, staff access, notifications, and audit records.')
    para(doc,'The system separates customer and administrator access. Customer verification uses a mobile one-time password workflow, while administrators sign in with email and password. Server-side validation and authorization protect operational functions. The database stores order headers and line items, payment records, status history, customer accounts, offers, inventory, and configuration. This report describes the implemented modules, requirements, architecture, database, interfaces, deployment process, and representative test cases. It is based on the supplied project source and documentation; external service credentials and live integrations depend on deployment configuration.')
    add_page(doc)
    # Contents is a native Word field, so page numbers can be refreshed in Word.
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; set_run_font(p.add_run('TABLE OF CONTENTS'),14,bold=True,color=NAVY)
    p=doc.add_paragraph(); r=p.add_run(); set_run_font(r,11); field(r,'TOC \\o "1-3" \\h \\z \\u')
    para(doc,'In Microsoft Word, right-click the table of contents and choose Update Field → Update entire table to refresh page numbers.')
    add_page(doc)
    title(doc,'LIST OF FIGURES')
    table(doc,['Figure No.','Title'],[
        ('2.1','Use Case Diagram'),('2.2','Order Placement Sequence Diagram'),('2.3','Order Processing Activity Diagram'),
        ('5.1','System Architecture Diagram'),('10.1','Customer Storefront Illustration'),('10.2','Menu and Ordering Illustration'),('10.3','Administrator Dashboard Illustration')],font_size=10)
    title(doc,'LIST OF TABLES')
    table(doc,['Table No.','Title'],[
        ('3.1','Hardware Configuration'),('3.2','Software Configuration'),('4.1','Front-End Technologies'),('4.2','Back-End Technologies'),
        ('5.1','Core Relational Database Entities'),('6.1','Source Code Modules'),('7.1','Representative System Test Cases')],font_size=10)
    add_page(doc)

    title(doc,'CHAPTER 1: INTRODUCTION')
    title(doc,'1.1 Problem Statement',2)
    para(doc,'Cafe operations often depend on disconnected activities: customers browse printed or informal menus, staff relay orders verbally, payment confirmation is handled separately, and managers compile sales and stock information from multiple sources. These practices can cause order-entry mistakes, slow service, inconsistent menu information, limited order visibility, and additional work when reviewing performance or customer history.')
    para(doc,'FrenchBell Cafe requires a single digital platform that connects customer ordering with staff operations. The system must support different fulfilment modes, keep order and payment data consistent, give staff a clear order queue, and provide administrative tools for menu and cafe configuration.')
    title(doc,'1.2 Project Description and Module Description',2)
    para(doc,'The project is a full-stack web application for FrenchBell Cafe in K. Narayanpura, Bengaluru. The customer-facing site and protected administrative workspace share a central API and PostgreSQL database. The interface is built with React 18 and Vite; the service layer uses Node.js and Express.js. The application exposes REST endpoints under /api and uses JSON over HTTP.')
    for x in [
        'Customer storefront: brand landing page, menu categories, search and dietary filters, item details, variants, and customization choices.',
        'Cart and checkout: quantity management, order notes, coupon application, order mode selection, totals, and order submission.',
        'Order fulfilment: dine-in table and party details, takeaway pickup details, or delivery address and contact details.',
        'Customer account: mobile OTP verification, profile management, order history, live order tracking, and electronic receipts.',
        'Administrator operations: protected login, live order board, order status and payment updates, menu and category management, customer directory, offers, advertisements, cafe settings, and analytics.',
        'Back-office support: inventory visibility, table QR management, payment and receipt records, admin invitations, notifications, and activity logs.'
    ]: bullet(doc,x)
    title(doc,'1.3 Objectives',2)
    for x in ['Digitize menu discovery and customer order submission.','Support dine-in, takeaway, and delivery order data in a unified workflow.','Provide staff with operational visibility of order status and payment state.','Centralize menu, offer, customer, and cafe configuration.','Maintain a relational history suitable for receipts, reporting, and audit review.']: bullet(doc,x)

    title(doc,'CHAPTER 2: SYSTEM STUDY')
    title(doc,'2.1 Existing System',2)
    para(doc,'In a conventional small-cafe workflow, menu updates, customer requests, kitchen communication, payment recording, and sales summaries can be maintained through separate paper or messaging processes. The exact existing process at the cafe was not supplied; the comparison below describes the common manual workflow that this project is designed to improve.')
    table(doc,['Area','Common Manual Approach','Effect'],[
        ('Menu','Printed or manually shared menus','Updates may not be reflected consistently'),('Order capture','Verbal or handwritten tickets','Repeated entry and transcription risk'),('Progress visibility','Staff communicate status directly','Customers may need to ask for updates'),('Reporting','Manual tally or spreadsheet','Time-consuming aggregation'),('Customer history','Scattered records','Limited lookup and follow-up')],font_size=9)
    title(doc,'2.2 Proposed System',2)
    para(doc,'The proposed application provides a shared web workflow. Customers submit structured orders through the storefront. The API validates data and persists orders and line items. Staff view orders in the administration dashboard and update status as preparation proceeds. Customer-facing tracking and receipt views read the resulting order records. The database also supports menu and offer management, payment status, analytics, and audit history.')
    title(doc,'2.3 Use Case Diagram',2)
    para(doc,'Figure 2.1 summarizes the principal interactions. Customers use the storefront and order services; administrators authenticate before accessing operational functions. The diagram represents application capabilities visible in the source tree and API routes.')
    doc.add_picture(str(DOCS/'report_assets'/'use_case.png'),width=Inches(6.4)); caption(doc,'Figure 2.1: Use Case Diagram')
    title(doc,'2.4 Sequential Diagram',2)
    para(doc,'The order sequence starts with a customer selecting items and a fulfilment mode. The browser submits checkout data to the API. The server validates the request, creates the order and its line items in PostgreSQL, then returns the order number. Staff later update the lifecycle status; the customer can retrieve current status through the tracking endpoint.')
    doc.add_picture(str(DOCS/'report_assets'/'sequence.png'),width=Inches(6.4)); caption(doc,'Figure 2.2: Order Placement Sequence Diagram')
    title(doc,'2.5 Activity Diagram',2)
    para(doc,'Figure 2.3 shows the main customer ordering path, including validation, order persistence, staff processing, and the completion path. Payment can be recorded separately from fulfilment status, so an order’s payment state and preparation state remain distinct.')
    doc.add_picture(str(DOCS/'report_assets'/'activity.png'),width=Inches(6.3)); caption(doc,'Figure 2.3: Order Processing Activity Diagram')

    title(doc,'CHAPTER 3: SYSTEM CONFIGURATION')
    title(doc,'3.1 Hardware Configuration',2)
    para(doc,'The repository does not prescribe a single hardware model. The following is a practical development configuration; production sizing should be selected for expected traffic and database workload.')
    table(doc,['Component','Minimum Development Configuration','Purpose'],[
        ('Client device','Dual-core CPU, 4 GB RAM, modern browser','Customer or administrator web access'),('Development workstation','4-core CPU, 8 GB RAM, 2 GB free storage','Run Node.js, Vite, editor, and local services'),('Server / hosting','Linux or compatible Node.js host, 2 vCPU, 2–4 GB RAM','Serve API and built frontend'),('Database','PostgreSQL 13+ compatible managed or local instance','Persistent application data'),('Network','Broadband connection; HTTPS in deployment','Browser/API and configured provider communication')],font_size=9)
    title(doc,'3.2 Software Configuration',2)
    table(doc,['Software','Version / Requirement','Use'],[
        ('Operating system','Windows, macOS, or Linux','Development and hosting'),('Node.js','18 or later','Run Vite and Express'),('npm','9 or later','Install dependencies and run scripts'),('React','18.3.x','Customer/admin UI'),('Vite','5.x','Development server and frontend build'),('Tailwind CSS','3.x','Utility styling'),('Express.js','4.x','REST API'),('PostgreSQL','13+ compatible','Relational persistence'),('Browser','Current Chrome, Edge, Firefox, or Safari','Responsive client interface')],font_size=9)
    para(doc,'The application reads operational credentials from environment variables. Secret values are intentionally excluded from this report. A deployment should configure database access, JWT signing, administrator bootstrap credentials, and any enabled payment, SMS, or email provider values in the hosting environment.')

    title(doc,'CHAPTER 4: SOFTWARE DESCRIPTION')
    title(doc,'4.1 Overview of Front End',2)
    para(doc,'The frontend is a single-page React application bootstrapped from src/main.jsx and composed in src/App.jsx. Shared contexts hold application state and authentication state. The customer site contains the landing page, menu, offers, cart, order-mode forms, checkout, confirmation, tracking, receipt, profile, and notification components. The administration interface is organized into dashboards and managers for operational data.')
    para(doc,'The storefront loads categories, menu items, offers, advertisements, and settings from API endpoints when available. Cart and selected order mode are stored in browser local storage as convenience state. Authentication tokens are also retained by the current client implementation; deployment should use HTTPS and review browser storage choices against the organization’s security requirements.')
    title(doc,'4.2 Overview of Back End',2)
    para(doc,'The backend is an Express.js application in server/index.js. It validates requests, performs authorization, reads and writes data through the database module, and returns JSON responses. Database access and migration logic are located under server/db. The schema uses PostgreSQL entities and foreign-key relationships for orders, order items, users, payments, receipts, settings, and supporting operations.')
    para(doc,'The API includes customer OTP endpoints, administrator authentication, menu and category endpoints, order creation and tracking, payment verification routes, receipts, offers, advertisements, tables, analytics, inventory, settings, notifications, and activity logs. Administrator-only endpoints use token authentication and an administrator role check. Exact third-party provider behavior depends on configured credentials and environment mode.')
    table(doc,['Layer','Technologies / Components','Responsibilities'],[
        ('Presentation','React 18, Vite, Tailwind CSS, Lucide React, Recharts','Responsive pages, forms, modals, dashboard charts'),('Service','Node.js, Express.js, REST/JSON','Validation, authentication, business rules, HTTP responses'),('Data','PostgreSQL, pg client, SQL schema/migrations','Persistent records, relations, order and audit history'),('External adapters','SMS, SMTP, payment provider configuration','OTP, invitation/reset email, online payment where configured')],font_size=9)

    title(doc,'CHAPTER 5: SYSTEM DESIGN')
    title(doc,'5.1 Architectural Design',2)
    para(doc,'The system follows a browser–API–database structure. The React client communicates with the Express API using HTTP requests. The API enforces access rules and coordinates persistent operations through the PostgreSQL layer. Optional external services are invoked only when configured. Figure 5.1 presents this logical arrangement.')
    doc.add_picture(str(DOCS/'report_assets'/'architecture.png'),width=Inches(6.3)); caption(doc,'Figure 5.1: System Architecture Diagram')
    title(doc,'5.2 Input Design',2)
    para(doc,'Inputs are collected through purpose-specific forms and validated both in the browser and on the server where applicable. Typical input groups include:')
    table(doc,['Input Form','Representative Fields','Validation / Handling'],[
        ('Customer verification','Mobile number, one-time code, optional name','Phone format, code expiry and attempt limits on the server'),('Menu item','Name, category, price, availability, variants','Admin authorization and field validation'),('Checkout','Customer contact, items, fulfilment details, notes, coupon','Required details depend on dine-in/takeaway/delivery'),('Payment','Order reference, method, provider response','Backend verification for configured online payments'),('Cafe configuration','Hours, tax, delivery settings, contact data','Administrator-only update endpoints')],font_size=9)
    title(doc,'5.3 Output Design',2)
    para(doc,'Outputs include the rendered menu, cart totals, order confirmation, order number, status tracking, electronic receipt, administration order board, sales summaries, customer records, stock indicators, notifications, and exported reports where supported. The UI communicates success and validation issues through dialogs, inline feedback, and notification components.')
    title(doc,'5.4 Database Design',2)
    para(doc,'The PostgreSQL schema defines 17 core tables. Orders are represented by an order header and associated order_items rows. User, menu, payment, receipt, and operational records are connected through identifiers and foreign keys. Order status transitions are retained in order_status_history; administrative events are captured in activity_logs.')
    table(doc,['Entity','Purpose / Key Relationship'],[
        ('users','Customer and administrator accounts; orders may reference a customer'),('menu_categories','Groups menu items'),('menu_items','Items linked to categories with price and availability data'),('customer_otps','Temporary customer verification state'),('orders','Order header, fulfilment, totals, status and payment state'),('order_items','Line items attached to an order'),('order_status_history','Order lifecycle changes'),('payments / receipts','Payment attempts and receipt records associated with orders'),('offers / advertisements','Promotional content and coupon rules'),('inventory / tables','Ingredient stock and dine-in table/QR records'),('settings / notifications','Cafe configuration and admin alerts'),('admin_invitations / activity_logs','Admin onboarding and accountability records')],font_size=9)
    para(doc,'The complete definitions and field constraints are in server/db/schema.sql. The report groups some closely related tables for readability; the source schema remains authoritative for exact field names and types.')

    title(doc,'CHAPTER 6: SOURCE CODE')
    para(doc,'The project is organized by client, service, and database responsibility. The principal source locations are listed in Table 6.1. The full source code is maintained in the project repository and is not duplicated here; this section identifies the modules most relevant to the implementation.')
    table(doc,['Path','Description'],[
        ('src/App.jsx','Top-level routing and customer/admin view composition'),('src/components/','Customer pages, dialogs, cart, checkout, and order views'),('src/components/admin/','Operations dashboard and management modules'),('src/context/AppContext.jsx','Shared cart, menu, settings, and order UI state'),('src/context/AuthContext.jsx','Customer/admin authentication client state'),('server/index.js','Express API routes and request handling'),('server/db/index.js','Database access layer'),('server/db/schema.sql','PostgreSQL table and index definitions'),('server/db/migrate.js','Database schema migration runner'),('server/payment/','Payment-related service routines'),('src/data/','Initial menu and inventory reference data')],font_size=9)
    para(doc,'For academic review, selected source files can be attached separately or referenced from the submitted repository. Secret-bearing .env files and live credentials must not be included in the report or source appendix.')

    title(doc,'CHAPTER 7: SYSTEM TESTING')
    para(doc,'The project README documents a backend integration test suite intended to run against an isolated in-memory PostgreSQL-compatible engine. This report provides representative functional scenarios derived from implemented workflows. The table is a test plan and expected behavior; it does not claim individual execution results. Record actual outcomes after running the suite and performing UI verification.')
    table(doc,['Test ID','Module / Scenario','Input / Action','Expected Result'],[
        ('TC-01','Menu loading','Open storefront with API available','Categories and menu items appear'),('TC-02','Customer OTP validation','Submit invalid phone or expired/incorrect code','Request is rejected with a clear validation response'),('TC-03','Cart calculation','Add items and change quantities','Line totals and subtotal update consistently'),('TC-04','Order mode validation','Checkout delivery without required address','Submission is blocked until required details are supplied'),('TC-05','Order creation','Submit valid order and line items','API returns an order reference and persists order data'),('TC-06','Admin route protection','Call protected admin function without valid admin token','Request is rejected as unauthorized'),('TC-07','Order status lifecycle','Admin advances an order status','Status is updated and history is retained'),('TC-08','Customer tracking','Request authorized order tracking','Current order status and summary are returned'),('TC-09','Offer management','Apply a qualifying coupon','Discount follows offer rules and is reflected in totals'),('TC-10','Payment verification','Submit invalid online payment signature','Payment is not marked successful'),('TC-11','Database health','Connect API to configured database','Health endpoint reports service state'),('TC-12','Admin analytics','Load analytics as an administrator','Dashboard receives summary data or an error state')],font_size=8)
    para(doc,'The README gives the project commands for frontend production build and backend integration tests. Those commands should be run in the target environment before submission if execution evidence is required.')

    title(doc,'CHAPTER 8: SYSTEM IMPLEMENTATION / DEPLOYMENT')
    para(doc,'A development setup uses Node.js and npm, a PostgreSQL database, and project environment configuration. The documented startup command runs the Express service and Vite client concurrently. A production build creates static frontend assets in dist; the Vercel configuration routes API requests to the service entry point and serves the frontend.')
    for x in ['Install dependencies with npm install.','Configure required environment variables in the development or hosting environment; do not commit secrets.','Run the database migration script against the intended PostgreSQL database.','Start development using npm run dev, or generate frontend assets using npm run build.','Deploy the API and frontend, configure HTTPS, database connectivity, administrator credentials, and only the external providers used by the deployment.','After deployment, verify health, authentication, ordering, status updates, and receipt behavior using non-production test data.']: bullet(doc,x)
    para(doc,'The project documentation describes production safeguards for OTP test mode and payment simulation. Provider integration availability depends on correct credentials, network access, provider account setup, and deployment configuration.')

    title(doc,'CHAPTER 9: CONCLUSION AND FUTURE ENHANCEMENT')
    title(doc,'9.1 Conclusion',2)
    para(doc,'FrenchBell Cafe Management System brings customer ordering and cafe administration into one web application. The implementation includes a menu and checkout experience, multiple fulfilment modes, customer verification and order history, staff order processing, menu and offer administration, analytics, and a relational PostgreSQL data model. The architecture provides clear separation between the browser interface, API, and persistent storage, allowing the cafe workflow to be managed through a common application.')
    title(doc,'9.2 Future Enhancement',2)
    for x in ['Add automated browser-based end-to-end tests for customer and administrator journeys.','Expand inventory functions with ingredient consumption rules, purchase orders, and supplier reconciliation.','Add kitchen display and printer integrations with configurable preparation queues.','Improve accessibility audits, localization, and low-bandwidth/mobile usability.','Add structured operational monitoring, backup verification, and data retention controls.','Complete and validate payment, SMS, email, and receipt delivery integrations for the deployment environment.','Add role granularity and configurable permissions for different cafe staff responsibilities.']: bullet(doc,x)

    title(doc,'CHAPTER 10: APPENDICES')
    title(doc,'10.1 Application Screenshots',2)
    para(doc,'Figures 10.1–10.3 are representative interface illustrations based on the application branding and implemented modules. They are illustrations for report layout, not captured runtime screenshots. Replace them with screenshots from the configured running application when evidence of the deployed interface is required.')
    for name,cap in [('cover_art.png','Figure 10.1: FrenchBell Cafe Customer Storefront Concept'),('menu_art.png','Figure 10.2: Menu and Order Selection Concept'),('admin_art.png','Figure 10.3: Cafe Operations Dashboard Concept')]:
        doc.add_picture(str(DOCS/'report_assets'/name),width=Inches(6.2)); caption(doc,cap)
    title(doc,'10.2 Setup and Execution Commands',2)
    table(doc,['Task','Command'],[
        ('Install dependencies','npm install'),('Run development services','npm run dev'),('Build frontend','npm run build'),('Run database migration','node server/db/migrate.js'),('Run documented test suite','node --experimental-vm-modules scripts/test-suite.js'),('Start server','npm run server')],font_size=9)
    title(doc,'10.3 Completion Fields',2)
    table(doc,['Field','To be completed by student / institution'],[
        ('Candidate name(s)','[Enter name(s) as registered]'),('Register number(s)','[Enter university register number(s)]'),('Project guide','[Enter approved guide name]'),('Submission date','[Enter date]'),('Actual test execution results','[Enter observed pass/fail results]')],font_size=9)

    title(doc,'CHAPTER 11: REFERENCES / BIBLIOGRAPHY')
    for x in [
        'FrenchBell Cafe Management System source repository: project files supplied with this report, including README.md, src/, server/, and package.json.',
        'Project database documentation: docs/DATABASE_SCHEMA.md and server/db/schema.sql.',
        'Project setup documentation: docs/SETUP.md.',
        'React documentation, https://react.dev/.',
        'Vite documentation, https://vite.dev/guide/.',
        'Express documentation, https://expressjs.com/.',
        'PostgreSQL documentation, https://www.postgresql.org/docs/.',
        'Tailwind CSS documentation, https://tailwindcss.com/docs.'
    ]: bullet(doc,x)
    para(doc,'The supplied ECP project document structure and student front-page template were used for section order and front matter. Project-specific descriptions were prepared from the local source code and documentation.')

def main():
    (DOCS/'report_assets').mkdir(exist_ok=True)
    doc=setup_doc(); import_front_matter(doc); make_report(doc)
    # Set core document metadata.
    doc.core_properties.title='FrenchBell Cafe Management System Project Report'
    doc.core_properties.subject='Enterprise Computing Project'
    doc.core_properties.author='[Candidate Name(s)]'
    doc.save(OUTPUT)
    print(OUTPUT)

if __name__=='__main__': main()
