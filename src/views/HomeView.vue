<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
const routes = router.options.routes.filter(route => !route.meta?.hideInMenu);

const navigateTo = (path) => {
  router.push(path);
};
</script>

<template>
  <main>
    <div class="route-list">
      <div
        class="route-item"
        v-for="route in routes"
        :key="route.path"
        @click="navigateTo(route.path)"
      >
        <span class="route-icon">{{ route.meta.icon }}</span>
        <div class="route-info">
          <h3>{{ route.meta.title }}</h3>
          <div class="route-arrow">→</div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.route-list {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
}

.route-item {
  display: flex;
  align-items: center;
  padding: 20px;
  margin-bottom: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.route-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.route-icon {
  font-size: 24px;
  margin-right: 20px;
}

.route-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-info h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.route-arrow {
  font-size: 20px;
  color: #666;
}
</style>
