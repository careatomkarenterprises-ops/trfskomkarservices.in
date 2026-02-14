// Google Analytics 4 - Universal Tracking Code
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// 🔴 REPLACE G-XXXXXXXXXX WITH YOUR GA4 MEASUREMENT ID
gtag('config', 'G-XXXXXXXXXX');

// Enhanced tracking for lead generation
document.addEventListener('DOMContentLoaded', function() {
    
    // Track outbound links (WhatsApp, Email, Phone)
    document.querySelectorAll('a[href^="https://wa.me"], a[href^="tel:"], a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function() {
            gtag('event', 'conversion', {
                'send_to': 'G-XXXXXXXXXX',
                'event_category': 'contact',
                'event_label': this.href,
                'value': 1
            });
        });
    });
    
    // Track form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            gtag('event', 'form_submission', {
                'send_to': 'G-XXXXXXXXXX',
                'event_category': 'lead',
                'event_label': this.id || 'contact_form',
                'value': 1
            });
        });
    });
    
    // Track downloads
    document.querySelectorAll('a[href$=".pdf"], a[href$=".xlsx"]').forEach(link => {
        link.addEventListener('click', function() {
            gtag('event', 'download', {
                'send_to': 'G-XXXXXXXXXX',
                'event_category': 'lead_magnet',
                'event_label': this.href.split('/').pop(),
                'value': 1
            });
        });
    });
});