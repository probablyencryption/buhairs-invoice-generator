# Design Guidelines: Bu Luxury Hairs Invoice Maker

## Design Approach
**Selected System**: Material Design with clean, professional customization
**Justification**: This is a utility-focused business productivity tool requiring clarity, efficiency, and professional polish. Material Design provides structured patterns for forms, data display, and document generation while maintaining a clean aesthetic suitable for business applications.

## Core Design Principles
1. **Professional Efficiency**: Clean, distraction-free interface that prioritizes speed of invoice creation
2. **Visual Clarity**: Clear hierarchy between form inputs, preview, and actions
3. **Document Fidelity**: Invoice preview must accurately represent final PDF output

## Typography
- **Primary Font**: Inter (Google Fonts) - clean, professional sans-serif
- **Headings**: 
  - H1: text-3xl font-semibold (page titles)
  - H2: text-xl font-semibold (section headers)
  - H3: text-lg font-medium (subsections)
- **Body Text**: text-base font-normal (forms, labels)
- **Small Text**: text-sm (helper text, metadata)
- **Invoice Preview**: Use exact fonts from sample invoice for authenticity

## Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 (p-2, m-4, gap-6, py-8)
- Consistent padding: p-6 for cards, p-8 for main containers
- Form field spacing: gap-4 between fields, gap-6 between sections
- Button spacing: px-6 py-3 for primary actions

**Grid Structure**:
- Main workspace: Two-column layout (60% form, 40% live preview on desktop)
- Mobile: Single column, stacked layout
- Bulk upload: Full-width interface with clear step progression

## Component Library

### Navigation
- **Top Header Bar**: Fixed position with app logo, "Bu Luxury Hairs" branding, invoice history link
- Clean white background with subtle border-bottom
- Height: h-16

### Forms & Inputs
- **Text Inputs**: Rounded corners (rounded-md), clear labels above fields, border focus states
- **Date Picker**: Material-style calendar dropdown with clear visual feedback
- **Textarea**: For address field with auto-expanding height based on content
- **Checkbox/Toggle**: For optional PRE code field activation
- **File Upload**: Drag-and-drop zone for logo with preview thumbnail

### Primary Layout Sections

**Single Invoice Creator**:
- Left panel: Form with fields (Invoice #, Date, PRE Code toggle, Customer Details)
- Right panel: Live invoice preview at scale showing exact 70x50cm layout
- Bottom: Primary action button "Generate & Download PDF" (full-width, prominent)

**Bulk Upload Interface**:
- Step 1: Date selection with large, clear date picker
- Step 2: Textarea for pasting raw customer data with example format shown
- Step 3: AI processing indicator with progress feedback
- Step 4: Preview grid showing all generated invoices (3-column card grid)
- Bottom: "Generate All PDFs" action button

**Invoice History**:
- Table view with columns: Invoice #, Date, Customer Name, Actions (View/Download)
- Search bar and date range filter at top
- Pagination for long lists

### Cards & Containers
- **Form Card**: White background, rounded-lg, shadow-sm, p-6
- **Preview Card**: White background, rounded-lg, shadow-md (slightly elevated), border to distinguish
- **Bulk Invoice Cards**: Compact preview cards in grid, hover state with shadow-lg

### Buttons
- **Primary**: Solid background, rounded-md, px-6 py-3, font-medium
- **Secondary**: Outline style with transparent background
- **Danger**: For delete/clear actions with appropriate visual weight
- **Icon Buttons**: For quick actions in tables (download, view icons from Heroicons)

### Data Display
- **Invoice Preview**: Exact replica of sample image layout
  - Fixed aspect ratio container representing 70x50cm
  - Logo positioned top-left as in sample
  - Invoice number top-right
  - Center-aligned delivery details section with proper line breaks
  - PRE code field when applicable
  - Date positioned as in sample
- **Status Indicators**: Small badges for processing states (generating, complete, error)

### Feedback & States
- **Loading States**: Skeleton loaders for invoice preview, spinner for AI processing
- **Success Messages**: Toast notifications for successful PDF generation
- **Error Handling**: Inline error messages below invalid form fields
- **Empty States**: Helpful illustrations and guidance for first-time users

## Special Considerations

### Invoice Preview Fidelity
- Use exact measurements to scale 70x50cm to screen display
- Border around preview to indicate print boundaries
- Toggle for "actual size" vs "fit to screen" view
- Watermark "PREVIEW" overlay that doesn't appear in PDF

### Bulk Upload UX
- Clear progress indicators showing X of Y invoices processed
- Ability to review and edit individual invoices before final generation
- Error handling for malformed data with specific line-by-line feedback
- Option to download as individual PDFs or single ZIP file

### Performance Indicators
- Show auto-saved status for invoice number tracking
- Clear indication when logo is loaded and stored
- Browser storage usage indicator

## Animations
Use sparingly for:
- Smooth transitions between form and preview panels (slide/fade)
- Loading spinner during AI processing
- Success checkmark animation on PDF generation
- Subtle scale on button hover (scale-105)

## Icons
**Library**: Heroicons (via CDN)
- Download icon for PDF generation
- Calendar for date picker
- Upload icon for logo/bulk data
- Search icon for history filter
- Check/X icons for status indicators