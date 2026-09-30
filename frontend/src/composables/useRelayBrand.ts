import { computed } from 'vue'
import { useAppStore } from '@/stores/app'
import { sanitizeUrl } from '@/utils/url'

// Brand comes purely from public settings, same fallbacks as upstream HomeView.
export function useRelayBrand() {
  const app = useAppStore()
  const siteName = computed(() => app.cachedPublicSettings?.site_name || app.siteName || 'Sub2API')
  const siteLogo = computed(() => sanitizeUrl(app.cachedPublicSettings?.site_logo || app.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
  const siteSubtitle = computed(() => app.cachedPublicSettings?.site_subtitle || 'AI API Gateway Platform')
  const docUrl = computed(() => sanitizeUrl(app.cachedPublicSettings?.doc_url || app.docUrl || ''))
  return { siteName, siteLogo, siteSubtitle, docUrl }
}
