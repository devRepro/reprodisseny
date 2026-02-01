<script setup lang="ts">
    import {
      Tabs,
      TabsList,
      TabsTrigger,
      TabsContent,
    } from "@/components/ui/tabs"
    
    defineProps<{ tabs: any[] }>()
    </script>
    
    <template>
      <section class="mx-auto max-w-6xl px-6 pb-24">
        <Tabs default-value="0">
          <TabsList class="mb-6">
            <TabsTrigger
              v-for="(t, i) in tabs"
              :key="i"
              :value="String(i)"
            >
              {{ t.title }}
            </TabsTrigger>
          </TabsList>
    
          <TabsContent
            v-for="(t, i) in tabs"
            :key="i"
            :value="String(i)"
          >
            <div class="flex gap-8 rounded-xl border p-8">
              <div class="h-40 w-32 rounded-lg bg-gray-200" />
              <ul class="space-y-2 text-sm text-gray-700">
                <li v-for="b in t.bullets" :key="b">• {{ b }}</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </template>
    