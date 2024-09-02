<template>
  <div>
    <div class="flex h-screen bg-base-100">
      <div class="w-64 flex-none border-r">
        <NavigationMenu />
        <KeepAlive>
          <ThreadList :currentThread="$route.params.id" />
        </KeepAlive>
      </div>

      <div class="flex flex-col flex-grow">
        <slot />
      </div>
    </div>
  </div>
</template>
