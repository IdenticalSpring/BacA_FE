import mainLayout from '@/layouts/mainLayout';

const componentsRouter = {
  name: 'components',
  path: '/components',
  component: mainLayout,
  redirect: '/components/vr',
  meta: {
    title: 'Components',
    icon: 'component',
    role: 36
  },
  children: [
    {
      name: 'vr',
      path: '/components/vr',
      component: () => import('@/views/components/vr/index'),
      meta: { title: 'Panorama', role: 23 }
    },
    {
      name: 'editor',
      path: '/components/editor',
      component: () => import('@/views/components/editor/index'),
      meta: { title: 'Rich text editor', role: 24 }
    },
    {
      name: 'lottery',
      path: '/components/lottery',
      component: () => import('@/views/components/lottery/index'),
      meta: { title: 'Lottery Page', role: 26 }
    },
    {
      name: 'table',
      path: '/components/table',
      component: () => import('@/views/components/table/index'),
      meta: { title: 'Table', role: 27 }
    },
    {
      name: 'form',
      path: '/components/form',
      component: () => import('@/views/components/form/index'),
      meta: { title: 'Form Page', role: 28 }
    },
    {
      name: 'loading',
      path: '/components/loading',
      component: () => import('@/views/components/loading/index'),
      meta: { title: 'Loading', role: 29 }
    },
    {
      name: 'uploadExcel',
      path: '/components/uploadExcel',
      component: () => import('@/views/components/uploadExcel/index'),
      meta: { title: 'Upload Excel', role: 30 }
    },
    {
      name: 'uploadAvatar',
      path: '/components/uploadAvatar',
      component: () => import('@/views/components/uploadAvatar/index'),
      meta: { title: 'Upload avatar', role: 31 }
    },
    {
      name: 'webSocket',
      path: '/components/webSocket',
      component: () => import('@/views/components/webSocket/index'),
      meta: { title: 'webSocket', role: 32 }
    },
    {
      name: 'screenshot',
      path: '/components/screenshot',
      component: () => import('@/views/components/screenshot/index'),
      meta: { title: 'screenshot', role: 33 }
    }
  ]
};

export default componentsRouter;
