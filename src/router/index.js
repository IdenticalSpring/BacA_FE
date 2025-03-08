import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

import Layout from '@/layouts';
import mainLayout from '@/layouts/mainLayout';
import echartRouter from './modules/echarts';
import componentsRouter from './modules/components';
import nestRouter from './modules/nest';

//基础路由
export const baseRoute = [
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/403',
    component: () => import('@/views/error/403'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error/404'),
    hidden: true
  },
  {
    path: '/500',
    component: () => import('@/views/error/500'),
    hidden: true
  }
];

export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    hidden: true,
    children: [
      {
        name: 'index',
        path: '/index',
        component: () => import('@/views/index/index'),
        meta: {
          role: 1,
          title: 'Dashboard',
          icon: 'dashboard'
        }
      },

      {
        name: 'icon',
        path: '/icon',
        component: () => import('@/views/icon/index'),
        meta: {
          role: 2,
          title: 'icon',
          icon: 'icon'
        }
      },
      {
        name: 'drag',
        path: 'http://gist006.gitee.io/vue-visual-drag/#/',
        component: Layout,
        meta: {
          title: 'Visual drag',
          icon: 'drag',
          role: 3
        }
      },
      {
        name: 'vue3',
        path: 'https://gist006.gitee.io/vue3-bigdata/#/homepage',
        component: Layout,
        meta: {
          title: 'vue3 big screen',
          icon: 'vue3',
          role: 3
        }
      },
      {
        name: 'music',
        path: 'http://gist006.gitee.io/uni-music/#/',
        component: Layout,
        meta: {
          title: 'Listen to music',
          icon: 'music',
          role: 3
        }
      },
      {
        name: 'webGl',
        component: mainLayout,
        path: '/webGl',
        redirect: '/webGl/ArcGis',
        meta: {
          role: 4,
          title: 'Map',
          icon: 'webGl'
        },
        children: [
          {
            name: 'ArcGis',
            path: '/webGl/ArcGis',
            component: () => import('@/views/webGl/ArcGis/index'),
            meta: { title: 'ArcGis', role: 5 }
          },
          {
            name: 'OpenLayers',
            path: '/webGl/OpenLayers',
            component: () => import('@/views/webGl/OpenLayers/index'),
            meta: { title: 'Interpolation analysis diagram', role: 6 }
          }
        ]
      },
      echartRouter,
      componentsRouter,
      nestRouter,
      {
        name: 'error',
        path: '/error',
        component: mainLayout,
        redirect: '/error/403',
        meta: { title: 'Error Pages', icon: 'error', role: 7 },
        children: [
          {
            name: '403',
            path: '/error/403',
            component: () => import('@/views/error/403'),
            meta: { title: '403', role: 8 }
          },
          {
            name: '404',
            path: '/error/404',
            component: () => import('@/views/error/404'),
            meta: { title: '404', role: 9 }
          },
          {
            name: '500',
            path: '/error/500',
            component: () => import('@/views/error/500'),
            meta: { title: '500', role: 10 }
          }
        ]
      },
      {
        name: 'userSystem',
        component: mainLayout,
        path: '/userSystem',
        redirect: '/userSystem/userInfo',
        meta: { title: 'Personal settings', icon: 'user', role: 11 },
        children: [
          {
            name: 'userInfo',
            path: '/userSystem/userInfo',
            component: () => import('@/views/userSystem/userInfo/index'),
            meta: { title: 'Personal Center', role: 12 }
          },
          {
            name: 'setting',
            path: '/userSystem/setting',
            component: () => import('@/views/userSystem/setting/index'),
            meta: { title: 'Personal settings', role: 13 }
          }
        ]
      },
      {
        name: 'system',
        component: mainLayout,
        path: '/system',
        redirect: '/system/userManage',
        meta: {
          role: 14,
          title: 'Backstage Management',
          icon: 'system'
        },
        children: [
          {
            name: 'userManage',
            path: '/system/userManage',
            component: () => import('@/views/system/userManage/index'),
            meta: { title: 'User Management', role: 15 }
          },
          {
            name: 'roleManage',
            path: '/system/roleManage',
            component: () => import('@/views/system/roleManage/index'),
            meta: { title: 'Role Management', role: 16 }
          }
        ]
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
];

const createRouter = function () {
  return new VueRouter({
    routes: baseRoute,
    scrollBehavior: () => ({ y: 0 })
  });
};

const router = createRouter();

export function resetRouter() {
  router.matcher = createRouter().matcher;
}

//重定向时报错，用这个不让他报错
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => err);
};

export default router;
