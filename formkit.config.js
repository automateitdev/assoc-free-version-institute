import { defaultConfig } from '@formkit/vue';
import { createMultiStepPlugin } from '@formkit/addons';
import '@formkit/addons/css/multistep';
import { primeInputs } from '@sfxcode/formkit-primevue';

const config = defaultConfig({
    plugins: [createMultiStepPlugin()],
    inputs: primeInputs
});

export default config;
