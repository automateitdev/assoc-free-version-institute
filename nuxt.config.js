// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  typescript: {
      strict: true
  },

  vite: {
      server: {
          hmr: {
              clientPort: 3000
          }
      }
  },

  alias: {
      'quill': process.dev ? 'quill/dist/quill.js' : 'quill'
  },

  app: {
      head: {
          title: 'Institute Portal',
          link: [
              { rel: 'icon', type: 'image/x-icon', href: `/${process.env.VENDOR}.ico` },
              {
                  id: 'theme-css',
                  rel: 'stylesheet',
                  type: 'text/css',
                  href: '/themes/saga-green/theme.css'
              }
          ]
      }
  },

  modules: ['nuxt-primevue', 'nuxt-icon', '@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt', '@nuxt/image'],

  primevue: {
      options: { ripple: true },
      components: {
          exclude: []
      }
  },

  build: {
      transpile: ['primevue']
  },

  script: [
      {
          strategy: 'lazyOnload',
          src: 'https://www.googletagmanager.com/gtag/js?id=UA-93461466-1'
      },
      {
          id: 'ga-analytics',
          strategy: 'lazyOnload',
          children: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'UA-93461466-1');
          `
      }
  ],

  css: ['primeicons/primeicons.css', 'primeflex/primeflex.scss', 'primevue/resources/primevue.min.css', '@/assets/styles.scss'],

  hooks: {
      'pages:extend'(pages) {
          function setMiddleware(pages) {
              const pagesToApplyMiddleware = [
                  '',
                  '/',
                  '/student',
                  '/student/enrollment',
                  '/student/enrollment/excel',
                  '/student/update',
                  '/student/migration',
                  '/student/push-back',
                  '/student/status',
                  '/student/report',
                  '/student/enrollment/excel',
                  '/fee-management/fee_startup',
                  '/fee-management/fee_amount_setup',
                  '/fee-management/date_setup',
                  '/fee-management/waiver/assign',
                  '/fee-management/waiver/assignedList',
                  '/master-settings/institute/startup',
                  '/fee-management/open-portal/',
                  '/admission/basic-setup',
                  '/admission/config',
                  '/admission/makeLink',
                  '/admission/startup',
                  '/admission/report',
                  '/admission/report/applicants',
                  '/admission/report/payments',
              ];

              function applyMiddlewareRecursively(pages) {
                  // console.log(pages)
                  for (const page of pages) {
                      if (pagesToApplyMiddleware.includes(page.path)) {
                          page.meta = page.meta || {};
                          page.meta.middleware = ['auth-required'];
                      }

                      if (page.children) {
                          applyMiddlewareRecursively(page.children);
                      }
                  }
              }

              applyMiddlewareRecursively(pages);
          }

          setMiddleware(pages);
      }
  },

  runtimeConfig: {
      public: {
          BASE_URL: process.env.BASE_URL,
          API_BASE_URL: process.env.API_BASE_URL,
          FRONTEND_URL: process.env.FRONTEND_URL,
      },
  },

  plugins: ['~/plugins/axios.js'],

  pinia: {
      autoImports: ['defineStore'],
      imports: {
          dirs: ['./stores']
      }
  },

  imports: {
      dirs: ['composables', 'composables/**']
  },

  ssr: false,
  compatibilityDate: '2024-12-14'
});