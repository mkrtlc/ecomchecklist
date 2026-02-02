# Google Tag Manager (GTM-NVDF8V3Q) – DataLayer Event Spec

These events are pushed to `window.dataLayer` with the key `event`.

| EVENT NAME | WHEN IT FIRES | RECOMMENDED TRIGGER (GTM) | VARIABLES (dataLayer keys) |
|---|---|---|---|
| page_view | On page load (Home + Analyze) | Custom Event = `page_view` | `page_path`, `page_title`, `page_location` |
| scroll_depth | When user reaches 25/50/75/100% scroll | Custom Event = `scroll_depth` | `scroll_percent`, `page_path` |
| url_input_focus | User focuses URL input | Custom Event = `url_input_focus` | `location` |
| url_input_change | User types in URL (throttled) | Custom Event = `url_input_change` | `location`, `value_length`, `has_protocol` |
| email_input_focus | User focuses email input | Custom Event = `email_input_focus` | `location` |
| cta_click | Any CTA click | Custom Event = `cta_click` | `location`, `cta_text` |
| form_start | First interaction with audit form | Custom Event = `form_start` | `form_id`, `location` |
| form_submit | Audit form submitted | Custom Event = `form_submit` | `form_id`, `location` |
| form_error | Validation / missing fields | Custom Event = `form_error` | `form_id`, `location`, `error` |
| audit_start | When audit begins | Custom Event = `audit_start` | `url` |
| audit_complete | When audit finishes | Custom Event = `audit_complete` | `url`, `score0to100` |
| pdf_download | When PDF export clicked | Custom Event = `pdf_download` | `url`, `filename` |
| check_expand | When a category/check is expanded | Custom Event = `check_expand` | `id`, `expanded` |

## Notes
- In GTM, create **Data Layer Variables** for each key you want to map into GA4 (or other) tags.
- Recommended: send `page_view` and `cta_click` into GA4 as primary conversions (CTA as event).
