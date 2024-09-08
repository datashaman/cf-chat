<template>
  <div>
    <div class="flex h-screen bg-base-100">
      <div class="w-64 flex-none border-r">
        <KeepAlive>
          <ThreadList />
        </KeepAlive>
      </div>

      <div class="flex flex-col flex-grow">
        <slot />
      </div>
    </div>
  </div>
</template>
