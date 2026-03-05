<script setup lang="ts">
import { computed } from "vue"
import { Check, Minus } from "lucide-vue-next"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Card, CardContent } from "@/components/ui/card"

type Head = readonly [string, string, string]

type CompareRow = {
  label: string
  online: boolean
  traditional: boolean
  repro: boolean
}

const props = defineProps<{
  head: Head
  rows: CompareRow[]
  highlightLabel?: string
}>()

const highlightTitle = computed(() => props.highlightLabel ?? props.head[2])

const ICON_OK =
  "inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#004F78]/10 text-[#004F78] ring-1 ring-[#004F78]/15"
const ICON_NO =
  "inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground/70 ring-1 ring-border"
</script>

<template>
  <section aria-label="Taula comparativa" class="w-full">
    <!-- DESKTOP -->
    <Card class="hidden lg:block border border-border/70 shadow-sm">
      <CardContent class="p-0">
        <div class="overflow-hidden rounded-xl">
          <Table class="w-full">
            <TableHeader>
              <TableRow class="bg-muted/30 border-b border-border">
                <TableHead class="h-14 px-6">
                  <!-- columna labels -->
                </TableHead>

                <TableHead class="h-14 px-4">
                  <div class="flex flex-col items-center">
                    <span class="text-xs font-semibold tracking-wide text-foreground/80">
                      {{ head[0] }}
                    </span>
                  </div>
                </TableHead>

                <TableHead class="h-14 px-4">
                  <div class="flex flex-col items-center">
                    <span class="text-xs font-semibold tracking-wide text-foreground/80">
                      {{ head[1] }}
                    </span>
                  </div>
                </TableHead>

                <!-- destacada -->
                <TableHead class="h-14 px-4 bg-[#DEF4FF] border-l border-[#004F78]/15">
                  <div class="flex flex-col items-center gap-1">
                    <span class="text-xs font-semibold tracking-wide text-[#004F78]">
                      {{ highlightTitle }}
                    </span>
                    <span class="inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-[#004F78] ring-1 ring-[#004F78]/10">
                      Recomanat
                    </span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow
                v-for="(r, i) in rows"
                :key="i"
                class="border-b border-border/70 hover:bg-muted/20 transition-colors"
              >
                <TableCell class="py-5 px-6 align-middle">
                  <div class="text-[15px] leading-6 font-medium text-foreground">
                    {{ r.label }}
                  </div>
                </TableCell>

                <TableCell class="py-5 px-4 text-center align-middle">
                  <span :class="r.online ? ICON_OK : ICON_NO" :aria-label="r.online ? 'Disponible' : 'No disponible'">
                    <Check v-if="r.online" class="h-5 w-5" aria-hidden="true" />
                    <Minus v-else class="h-5 w-5" aria-hidden="true" />
                  </span>
                </TableCell>

                <TableCell class="py-5 px-4 text-center align-middle">
                  <span :class="r.traditional ? ICON_OK : ICON_NO" :aria-label="r.traditional ? 'Disponible' : 'No disponible'">
                    <Check v-if="r.traditional" class="h-5 w-5" aria-hidden="true" />
                    <Minus v-else class="h-5 w-5" aria-hidden="true" />
                  </span>
                </TableCell>

                <!-- destacada -->
                <TableCell class="py-5 px-4 text-center align-middle bg-[#DEF4FF] border-l border-[#004F78]/15">
                  <span :class="r.repro ? 'inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#004F78] text-white shadow-sm' : ICON_NO"
                        :aria-label="r.repro ? 'Disponible' : 'No disponible'">
                    <Check v-if="r.repro" class="h-5 w-5" aria-hidden="true" />
                    <Minus v-else class="h-5 w-5" aria-hidden="true" />
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- MOBILE/TABLET -->
    <div class="lg:hidden space-y-4">
      <Card
        v-for="(r, i) in rows"
        :key="i"
        class="border border-border/70 shadow-sm"
      >
        <CardContent class="p-5">
          <div class="text-[15px] leading-6 font-medium text-foreground">
            {{ r.label }}
          </div>

          <div class="mt-4 grid grid-cols-1 gap-2">
            <!-- online -->
            <div class="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
              <span class="text-sm text-foreground/80">{{ head[0] }}</span>
              <span :class="r.online ? 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#004F78]/10 text-[#004F78] ring-1 ring-[#004F78]/15' : 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground/70 ring-1 ring-border'">
                <Check v-if="r.online" class="h-4 w-4" />
                <Minus v-else class="h-4 w-4" />
              </span>
            </div>

            <!-- tradicional -->
            <div class="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
              <span class="text-sm text-foreground/80">{{ head[1] }}</span>
              <span :class="r.traditional ? 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#004F78]/10 text-[#004F78] ring-1 ring-[#004F78]/15' : 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground/70 ring-1 ring-border'">
                <Check v-if="r.traditional" class="h-4 w-4" />
                <Minus v-else class="h-4 w-4" />
              </span>
            </div>

            <!-- repro (destacada) -->
            <div class="flex items-center justify-between rounded-xl border border-[#004F78]/15 bg-[#DEF4FF] px-3 py-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-[#004F78]">{{ highlightTitle }}</span>
                <span class="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-[#004F78] ring-1 ring-[#004F78]/10">
                  Recomanat
                </span>
              </div>

              <span :class="r.repro ? 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#004F78] text-white shadow-sm' : 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#004F78]/40 ring-1 ring-[#004F78]/10'">
                <Check v-if="r.repro" class="h-4 w-4" />
                <Minus v-else class="h-4 w-4" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
</template>