declare const describe: any;
declare const it: any;
declare const expect: any;

import { apiClient } from '../src/shared/api/apiClient';

// Mock simple para verificar la configuración de Jest
describe('apiClient Configuración', () => {
  it('Debe tener la base URL configurada', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
  });
});
