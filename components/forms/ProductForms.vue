
        id="nombre"
      />
    </div>
    <!-- Empresa -->
    <div class="relative">
      <Input
        v-model="form.empresa"
        placeholder="Empresa"
        class="pl-4"
        id="empresa"
      />
    </div>

    <!-- Email -->
    <div class="relative">
      <Mail class="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
      <Input
        v-model="form.email"
        type="email"
        placeholder="Tu correo electrónico"
        class="pl-10"
        id="email"
      />
    </div>

    <!-- Teléfono -->
    <div class="relative">
      <Phone class="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
      <Input
        v-model="form.telefono"
        placeholder="Teléfono (opcional)"
        class="pl-10"
        id="telefono"
      />
    </div>

    <!-- Campos dinámicos -->
    <div v-if="props.formFields?.length" class="space-y-4">
      <div v-for="field in props.formFields" :key="field.name" class="relative">
        <Input
          v-if="field.type === 'text' || field.type === 'number'"
          v-model="form[field.name]"
          :type="field.type"
          :placeholder="field.label + (field.required ? ' *' : '')"
          class="pl-4"
        />
        <select
          v-else-if="field.type === 'select'"
          v-model="form[field.name]"
          :required="field.required"
          class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option disabled value="">{{ field.label }}{{ field.required ? ' *' : '' }}</option>
          <option v-for="option in field.options" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>

    <div v-else class="text-sm text-gray-500 italic">
      Este producto no tiene campos personalizados configurados.
    </div>

    <!-- Checkbox aceptación -->
    <div class="flex items-start gap-2 pt-2">
      <input
        id="acepta"
        type="checkbox"
        v-model="form.acepta"
        class="mt-1 accent-primary"
      />
      <label for="acepta" class="text-sm text-gray-700 leading-tight">
        He leído y acepto los
        <NuxtLink to="/terms" target="_blank" class="underline text-primary hover:text-primary/80">
          Términos y condiciones
        </NuxtLink>
      </label>
    </div>

    <!-- Botón CTA -->
    <div class="pt-4">
      <Button type="submit" class="w-full flex items-center justify-center gap-2">
        <CheckCircle class="w-4 h-4" />
        Solicitar presupuesto
      </Button>
    </div>
  </form>

  <FormsUiModalGracias :open="modalGracias" @close="modalGracias = false; router.push('/categorias')" />
  <FormsUiModalAvisoTerminos :open="modalAviso" @close="modalAviso = false" />
</template>


