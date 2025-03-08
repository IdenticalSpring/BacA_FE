import mainLayout from '@/layouts/mainLayout';

const echartRouter = {
  name: 'echarts',
  path: '/echarts',
  component: mainLayout,
  redirect: '/echarts/bar',
  meta: {
    role: 35,
    title: 'chart',
    icon: 'echarts'
  },
  children: [
    {
      name: 'bar',
      path: '/echarts/bar',
      component: () => import('@/views/echarts/bar/index'),
      meta: { title: 'Bar Chart', role: 17 }
    },
    {
      name: 'line',
      path: '/echarts/line',
      component: () => import('@/views/echarts/line/index'),
      meta: { title: 'Line chart', role: 18 }
    },
    {
      name: 'pie',
      path: '/echarts/pie',
      component: () => import('@/views/echarts/pie/index'),
      meta: { title: 'Pie Chart', role: 19 }
    },
    {
      name: 'graph',
      path: '/echarts/graph',
      component: () => import('@/views/echarts/graph/index'),
      meta: {
        role: 20,
        title: 'Relationship diagram'
      }
    },
    {
      name: 'map',
      path: '/echarts/map',
      component: () => import('@/views/echarts/map/index'),
      meta: {
        role: 21,
        title: 'map'
      }
    },
    {
      name: 'other',
      path: '/echarts/other',
      component: () => import('@/views/echarts/other/index'),
      meta: {
        role: 22,
        title: 'Other charts'
      }
    }
  ]
};

export default echartRouter;
