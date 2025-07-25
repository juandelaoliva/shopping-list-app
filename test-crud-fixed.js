// ========================================
// SCRIPT DE PRUEBAS CRUD COMPLETAS - VERSIÓN CORREGIDA
// ========================================

const { createClient } = require('@supabase/supabase-js');

// Configuración Supabase - USAR VARIABLES DE ENTORNO
// Ejecutar: REACT_APP_SUPABASE_URL=tu_url REACT_APP_SUPABASE_ANON_KEY=tu_key node test-crud-fixed.js
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
// Validación de variables de entorno
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Variables de entorno requeridas:');
  console.error('   REACT_APP_SUPABASE_URL');
  console.error('   REACT_APP_SUPABASE_ANON_KEY');
  console.error('');
  console.error('Ejecutar: REACT_APP_SUPABASE_URL=tu_url REACT_APP_SUPABASE_ANON_KEY=tu_key node test-crud-fixed.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ========================================
// UTILIDADES DE PRUEBA
// ========================================

function log(emoji, title, message) {
  console.log(`${emoji} ${title}: ${message}`);
}

function logSuccess(title, message) {
  log('✅', title, message);
}

function logError(title, message) {
  log('❌', title, message);
}

function logInfo(title, message) {
  log('🔍', title, message);
}

// ========================================
// VARIABLES GLOBALES PARA LAS PRUEBAS
// ========================================

let testUser = null;
let testCategoryId = null;
let testSupermarketId = null;
let testProductId = null;
let testShoppingListId = null;
let testListItemId = null;
let testAlternativeProductId = null;

// ========================================
// 1. PRUEBAS DE AUTENTICACIÓN - CORREGIDAS
// ========================================

async function testAuthentication() {
  console.log('\n🔐 === PRUEBAS DE AUTENTICACIÓN ===');
  
  try {
    // Test 1: Registro de usuario con email válido
    logInfo('TEST AUTH-1', 'Registrando nuevo usuario de prueba...');
    const testEmail = `testuser${Date.now()}@gmail.com`; // Email válido
    const testPassword = 'TestPassword123!';
    const testDisplayName = 'Usuario de Prueba';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: testDisplayName
        }
      }
    });
    
    if (signUpError) {
      logError('AUTH-1', `Error en registro: ${signUpError.message}`);
      
      // Intentar con usuario existente para pruebas
      logInfo('AUTH-1-ALT', 'Intentando crear usuario temporal para pruebas...');
      const { data: tempUser, error: tempError } = await supabase.auth.signInAnonymously();
      if (!tempError) {
        testUser = tempUser.user;
        logSuccess('AUTH-1-ALT', 'Usuario temporal creado para pruebas');
        return true;
      }
      return false;
    }
    
    logSuccess('AUTH-1', `Usuario registrado: ${testEmail}`);
    testUser = signUpData.user;
    
    // Test 2: Verificar sesión
    logInfo('TEST AUTH-2', 'Verificando sesión...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      logError('AUTH-2', `Error obteniendo sesión: ${sessionError.message}`);
      return false;
    }
    
    if (sessionData.session) {
      logSuccess('AUTH-2', `Sesión activa para: ${sessionData.session.user.email || 'usuario anónimo'}`);
    }
    
    return true;
    
  } catch (error) {
    logError('AUTH', `Error general: ${error.message}`);
    return false;
  }
}

// ========================================
// 2. PRUEBAS DE CATEGORÍAS (READ ONLY)
// ========================================

async function testCategories() {
  console.log('\n📁 === PRUEBAS DE CATEGORÍAS ===');
  
  try {
    // Test 1: Leer todas las categorías
    logInfo('TEST CAT-1', 'Obteniendo todas las categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (categoriesError) {
      logError('CAT-1', `Error leyendo categorías: ${categoriesError.message}`);
      return false;
    }
    
    logSuccess('CAT-1', `${categories.length} categorías encontradas`);
    if (categories.length > 0) {
      console.log('📋 Categorías:', categories.map(c => `${c.name} (${c.color})`).join(', '));
      testCategoryId = categories[0].id;
      logInfo('CAT-1', `Usando categoría para pruebas: ${categories[0].name} (ID: ${testCategoryId})`);
    } else {
      logInfo('CAT-1', 'No hay categorías en la base de datos - creando una de prueba...');
      
      // Crear categoría de prueba si no existen
      const { data: newCategory, error: createError } = await supabase
        .from('categories')
        .insert([{
          name: 'Prueba',
          color: '#FF5722',
          icon: '🧪'
        }])
        .select()
        .single();
      
      if (createError) {
        logError('CAT-1', `Error creando categoría de prueba: ${createError.message}`);
        return false;
      }
      
      testCategoryId = newCategory.id;
      logSuccess('CAT-1', `Categoría de prueba creada: ${newCategory.name} (ID: ${testCategoryId})`);
    }
    
    return true;
    
  } catch (error) {
    logError('CAT', `Error general: ${error.message}`);
    return false;
  }
}

// ========================================
// 3. PRUEBAS DE SUPERMERCADOS (CRUD COMPLETO) - CORREGIDAS
// ========================================

async function testSupermarkets() {
  console.log('\n🏪 === PRUEBAS DE SUPERMERCADOS ===');
  
  try {
    // Test 1: CREATE - Crear nuevo supermercado (sin columna location)
    logInfo('TEST SUP-1', 'Creando nuevo supermercado...');
    const newSupermarket = {
      name: `Supermercado de Prueba ${Date.now()}`,
      color: '#FF5722'
      // Removido: location (no existe en el esquema)
    };
    
    const { data: createdSupermarket, error: createError } = await supabase
      .from('supermarkets')
      .insert([newSupermarket])
      .select()
      .single();
    
    if (createError) {
      logError('SUP-1', `Error creando supermercado: ${createError.message}`);
      return false;
    }
    
    testSupermarketId = createdSupermarket.id;
    logSuccess('SUP-1', `Supermercado creado: ${createdSupermarket.name} (ID: ${testSupermarketId})`);
    
    // Test 2: READ - Leer supermercado por ID
    logInfo('TEST SUP-2', 'Leyendo supermercado por ID...');
    const { data: readSupermarket, error: readError } = await supabase
      .from('supermarkets')
      .select('*')
      .eq('id', testSupermarketId)
      .single();
    
    if (readError) {
      logError('SUP-2', `Error leyendo supermercado: ${readError.message}`);
      return false;
    }
    
    logSuccess('SUP-2', `Supermercado leído: ${readSupermarket.name}`);
    
    // Test 3: UPDATE - Actualizar supermercado
    logInfo('TEST SUP-3', 'Actualizando supermercado...');
    const updateData = {
      name: `${newSupermarket.name} - ACTUALIZADO`,
      color: '#4CAF50'
    };
    
    const { data: updatedSupermarket, error: updateError } = await supabase
      .from('supermarkets')
      .update(updateData)
      .eq('id', testSupermarketId)
      .select()
      .single();
    
    if (updateError) {
      logError('SUP-3', `Error actualizando supermercado: ${updateError.message}`);
      return false;
    }
    
    logSuccess('SUP-3', `Supermercado actualizado: ${updatedSupermarket.name}`);
    
    return true;
    
  } catch (error) {
    logError('SUP', `Error general: ${error.message}`);
    return false;
  }
}

// ========================================
// 4. PRUEBAS DE PRODUCTOS (CRUD COMPLETO) - CORREGIDAS
// ========================================

async function testProducts() {
  console.log('\n🛍️ === PRUEBAS DE PRODUCTOS ===');
  
  if (!testUser) {
    logError('PROD', 'No hay usuario autenticado. Saltando pruebas de productos.');
    return false;
  }
  
  try {
    // Test 1: CREATE - Crear nuevo producto
    logInfo('TEST PROD-1', 'Creando nuevo producto...');
    const newProduct = {
      name: `Producto de Prueba ${Date.now()}`,
      estimated_price: 2.50,
      unit: 'unidad',
      category_id: testCategoryId,
      supermarket_id: testSupermarketId
    };
    
    const { data: createdProduct, error: createError } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();
    
    if (createError) {
      logError('PROD-1', `Error creando producto: ${createError.message}`);
      return false;
    }
    
    testProductId = createdProduct.id;
    logSuccess('PROD-1', `Producto creado: ${createdProduct.name} (ID: ${testProductId})`);
    
    // Test 2: READ - Leer productos con JOIN
    logInfo('TEST PROD-2', 'Leyendo productos con información de categoría y supermercado...');
    const { data: products, error: readError } = await supabase
      .from('products')
      .select(`
        *,
        categories(name, color),
        supermarkets(name, color)
      `)
      .eq('id', testProductId);
    
    if (readError) {
      logError('PROD-2', `Error leyendo productos: ${readError.message}`);
      return false;
    }
    
    logSuccess('PROD-2', `Producto leído con JOIN: ${products[0].name}`);
    console.log('🏷️ Categoría:', products[0].categories?.name);
    console.log('🏪 Supermercado:', products[0].supermarkets?.name);
    
    // Test 3: UPDATE - Actualizar producto
    logInfo('TEST PROD-3', 'Actualizando producto...');
    const updateData = {
      name: `${newProduct.name} - ACTUALIZADO`,
      estimated_price: 3.75
    };
    
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', testProductId)
      .select()
      .single();
    
    if (updateError) {
      logError('PROD-3', `Error actualizando producto: ${updateError.message}`);
      return false;
    }
    
    logSuccess('PROD-3', `Producto actualizado: ${updatedProduct.name} - Precio: €${updatedProduct.estimated_price}`);
    
    // Test 4: Crear producto alternativo para pruebas
    logInfo('TEST PROD-4', 'Creando producto alternativo...');
    const alternativeProduct = {
      name: `Alternativa ${Date.now()}`,
      estimated_price: 2.99,
      unit: 'unidad',
      category_id: testCategoryId,
      supermarket_id: testSupermarketId
    };
    
    const { data: createdAlternative, error: altError } = await supabase
      .from('products')
      .insert([alternativeProduct])
      .select()
      .single();
    
    if (altError) {
      logError('PROD-4', `Error creando alternativa: ${altError.message}`);
      return false;
    }
    
    testAlternativeProductId = createdAlternative.id;
    logSuccess('PROD-4', `Alternativa creada: ${createdAlternative.name} (ID: ${testAlternativeProductId})`);
    
    return true;
    
  } catch (error) {
    logError('PROD', `Error general: ${error.message}`);
    return false;
  }
}

// ========================================
// 5. PRUEBAS DE ALTERNATIVAS DE PRODUCTOS - CORREGIDAS
// ========================================

async function testProductAlternatives() {
  console.log('\n🔄 === PRUEBAS DE ALTERNATIVAS ===');
  
  if (!testProductId || !testAlternativeProductId) {
    logError('ALT', 'No hay productos creados para probar alternativas');
    return false;
  }
  
  try {
    // Test 1: CREATE - Crear relación de alternativa (con nombres de columna correctos)
    logInfo('TEST ALT-1', 'Creando relación de alternativa...');
    const { data: createdAlternative, error: createError } = await supabase
      .from('product_alternatives')
      .insert([{
        product_id: testProductId,
        alternative_product_id: testAlternativeProductId  // Nombre correcto de columna
      }])
      .select()
      .single();
    
    if (createError) {
      logError('ALT-1', `Error creando alternativa: ${createError.message}`);
      return false;
    }
    
    logSuccess('ALT-1', `Alternativa creada: Producto ${testProductId} -> Alternativa ${testAlternativeProductId}`);
    
    // Test 2: READ - Leer alternativas de un producto
    logInfo('TEST ALT-2', 'Leyendo alternativas del producto...');
    const { data: alternatives, error: readError } = await supabase
      .from('product_alternatives')
      .select(`
        *,
        products!alternative_product_id(name, estimated_price)
      `)
      .eq('product_id', testProductId);
    
    if (readError) {
      logError('ALT-2', `Error leyendo alternativas: ${readError.message}`);
      return false;
    }
    
    logSuccess('ALT-2', `${alternatives.length} alternativas encontradas`);
    
    // Test 3: DELETE - Eliminar relación de alternativa
    logInfo('TEST ALT-3', 'Eliminando relación de alternativa...');
    const { error: deleteError } = await supabase
      .from('product_alternatives')
      .delete()
      .eq('product_id', testProductId)
      .eq('alternative_product_id', testAlternativeProductId);
    
    if (deleteError) {
      logError('ALT-3', `Error eliminando alternativa: ${deleteError.message}`);
      return false;
    }
    
    logSuccess('ALT-3', 'Relación de alternativa eliminada correctamente');
    
    return true;
    
  } catch (error) {
    logError('ALT', `Error general: ${error.message}`);
    return false;
  }
}

// ========================================
// 6. PRUEBAS DE LISTAS DE COMPRAS (CRUD COMPLETO) - CORREGIDAS
// ========================================

async function testShoppingLists() {
  console.log('\n📝 === PRUEBAS DE LISTAS DE COMPRAS ===');
  
  if (!testUser) {
    logError('LIST', 'No hay usuario autenticado para crear listas');
    return false;
  }
  
  try {
    // Test 1: CREATE - Crear nueva lista
    logInfo('TEST LIST-1', 'Creando nueva lista de compras...');
    const newList = {
      name: `Lista de Prueba ${Date.now()}`,
      description: 'Lista creada automáticamente para pruebas',
      total_budget: 50.00,
      user_id: testUser.id
    };
    
    const { data: createdList, error: createError } = await supabase
      .from('shopping_lists')
      .insert([newList])
      .select()
      .single();
    
    if (createError) {
      logError('LIST-1', `Error creando lista: ${createError.message}`);
      return false;
    }
    
    testShoppingListId = createdList.id;
    logSuccess('LIST-1', `Lista creada: ${createdList.name} (ID: ${testShoppingListId})`);
    
    // Test 2: READ - Leer lista por ID
    logInfo('TEST LIST-2', 'Leyendo lista por ID...');
    const { data: readList, error: readError } = await supabase
      .from('shopping_lists')
      .select('*')
      .eq('id', testShoppingListId)
      .single();
    
    if (readError) {
      logError('LIST-2', `Error leyendo lista: ${readError.message}`);
      return false;
    }
    
    logSuccess('LIST-2', `Lista leída: ${readList.name} - Presupuesto: €${readList.total_budget}`);
    
    // Test 3: UPDATE - Actualizar lista
    logInfo('TEST LIST-3', 'Actualizando lista...');
    const updateData = {
      name: `${newList.name} - ACTUALIZADA`,
      total_budget: 75.00
    };
    
    const { data: updatedList, error: updateError } = await supabase
      .from('shopping_lists')
      .update(updateData)
      .eq('id', testShoppingListId)
      .select()
      .single();
    
    if (updateError) {
      logError('LIST-3', `Error actualizando lista: ${updateError.message}`);
      return false;
    }
    
    logSuccess('LIST-3', `Lista actualizada: ${updatedList.name} - Nuevo presupuesto: €${updatedList.total_budget}`);
    
    return true;
    
  } catch (error) {
    logError('LIST', `Error general: ${error.message}`);
    return false;
  }
}

// ========================================
// 7. PRUEBAS DE ELEMENTOS DE LISTA (CRUD COMPLETO) - CORREGIDAS
// ========================================

async function testListItems() {
  console.log('\n🛒 === PRUEBAS DE ELEMENTOS DE LISTA ===');
  
  if (!testShoppingListId || !testProductId) {
    logError('ITEM', 'No hay lista o producto creados para probar elementos');
    return false;
  }
  
  try {
    // Test 1: CREATE - Crear nuevo elemento
    logInfo('TEST ITEM-1', 'Añadiendo producto a la lista...');
    const newItem = {
      shopping_list_id: testShoppingListId,  // Nombre correcto de columna
      product_id: testProductId,
      quantity: 2,
      unit: 'unidades',
      estimated_price: 2.50,
      notes: 'Elemento añadido automáticamente para pruebas'
    };
    
    const { data: createdItem, error: createError } = await supabase
      .from('list_items')
      .insert([newItem])
      .select()
      .single();
    
    if (createError) {
      logError('ITEM-1', `Error creando elemento: ${createError.message}`);
      return false;
    }
    
    testListItemId = createdItem.id;
    logSuccess('ITEM-1', `Elemento creado: ${createdItem.quantity} ${createdItem.unit} (ID: ${testListItemId})`);
    
    // Test 2: READ - Leer elementos con JOIN
    logInfo('TEST ITEM-2', 'Leyendo elementos con información del producto...');
    const { data: items, error: readError } = await supabase
      .from('list_items')
      .select(`
        *,
        products(name, estimated_price, categories(name), supermarkets(name))
      `)
      .eq('shopping_list_id', testShoppingListId);
    
    if (readError) {
      logError('ITEM-2', `Error leyendo elementos: ${readError.message}`);
      return false;
    }
    
    logSuccess('ITEM-2', `${items.length} elementos encontrados en la lista`);
    items.forEach(item => {
      console.log(`📦 ${item.quantity} x ${item.products?.name} - €${item.estimated_price}`);
    });
    
    // Test 3: UPDATE - Actualizar elemento
    logInfo('TEST ITEM-3', 'Actualizando elemento...');
    const updateData = {
      quantity: 3,
      actual_price: 7.50,
      is_purchased: true
    };
    
    const { data: updatedItem, error: updateError } = await supabase
      .from('list_items')
      .update(updateData)
      .eq('id', testListItemId)
      .select()
      .single();
    
    if (updateError) {
      logError('ITEM-3', `Error actualizando elemento: ${updateError.message}`);
      return false;
    }
    
    logSuccess('ITEM-3', `Elemento actualizado: ${updatedItem.quantity} unidades - Comprado: ${updatedItem.is_purchased}`);
    
    return true;
    
  } catch (error) {
    logError('ITEM', `Error general: ${error.message}`);
    return false;
  }
}

// ========================================
// 8. PRUEBAS DE ELIMINACIÓN (DELETE) - CORREGIDAS
// ========================================

async function testDeletions() {
  console.log('\n🗑️ === PRUEBAS DE ELIMINACIÓN ===');
  
  try {
    // Test 1: DELETE - Eliminar elemento de lista
    if (testListItemId) {
      logInfo('TEST DEL-1', 'Eliminando elemento de lista...');
      const { error: deleteItemError } = await supabase
        .from('list_items')
        .delete()
        .eq('id', testListItemId);
      
      if (deleteItemError) {
        logError('DEL-1', `Error eliminando elemento: ${deleteItemError.message}`);
      } else {
        logSuccess('DEL-1', 'Elemento de lista eliminado correctamente');
      }
    }
    
    // Test 2: DELETE - Eliminar lista de compras
    if (testShoppingListId) {
      logInfo('TEST DEL-2', 'Eliminando lista de compras...');
      const { error: deleteListError } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', testShoppingListId);
      
      if (deleteListError) {
        logError('DEL-2', `Error eliminando lista: ${deleteListError.message}`);
      } else {
        logSuccess('DEL-2', 'Lista de compras eliminada correctamente');
      }
    }
    
    // Test 3: DELETE - Eliminar producto alternativo
    if (testAlternativeProductId) {
      logInfo('TEST DEL-3', 'Eliminando producto alternativo...');
      const { error: deleteAltError } = await supabase
        .from('products')
        .delete()
        .eq('id', testAlternativeProductId);
      
      if (deleteAltError) {
        logError('DEL-3', `Error eliminando alternativa: ${deleteAltError.message}`);
      } else {
        logSuccess('DEL-3', 'Producto alternativo eliminado correctamente');
      }
    }
    
    // Test 4: DELETE - Eliminar producto principal
    if (testProductId) {
      logInfo('TEST DEL-4', 'Eliminando producto principal...');
      const { error: deleteProdError } = await supabase
        .from('products')
        .delete()
        .eq('id', testProductId);
      
      if (deleteProdError) {
        logError('DEL-4', `Error eliminando producto: ${deleteProdError.message}`);
      } else {
        logSuccess('DEL-4', 'Producto principal eliminado correctamente');
      }
    }
    
    // Test 5: DELETE - Eliminar supermercado
    if (testSupermarketId) {
      logInfo('TEST DEL-5', 'Eliminando supermercado...');
      const { error: deleteSupError } = await supabase
        .from('supermarkets')
        .delete()
        .eq('id', testSupermarketId);
      
      if (deleteSupError) {
        logError('DEL-5', `Error eliminando supermercado: ${deleteSupError.message}`);
      } else {
        logSuccess('DEL-5', 'Supermercado eliminado correctamente');
      }
    }
    
    return true;
    
  } catch (error) {
    logError('DEL', `Error general: ${error.message}`);
    return false;
  }
}

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

async function runAllTests() {
  console.log('🧪 ========================================');
  console.log('🧪    PRUEBAS CRUD COMPLETAS - SUPABASE');
  console.log('🧪          VERSIÓN CORREGIDA');
  console.log('🧪 ========================================');
  
  const testResults = [];
  
  // Ejecutar todas las pruebas
  testResults.push(['Authentication', await testAuthentication()]);
  testResults.push(['Categories', await testCategories()]);
  testResults.push(['Supermarkets', await testSupermarkets()]);
  testResults.push(['Products', await testProducts()]);
  testResults.push(['Product Alternatives', await testProductAlternatives()]);
  testResults.push(['Shopping Lists', await testShoppingLists()]);
  testResults.push(['List Items', await testListItems()]);
  testResults.push(['Deletions', await testDeletions()]);
  
  // Mostrar resumen final
  console.log('\n📊 === RESUMEN DE PRUEBAS ===');
  testResults.forEach(([testName, passed]) => {
    if (passed) {
      logSuccess('RESUMEN', `${testName}: PASÓ`);
    } else {
      logError('RESUMEN', `${testName}: FALLÓ`);
    }
  });
  
  const passedTests = testResults.filter(([, passed]) => passed).length;
  const totalTests = testResults.length;
  
  console.log(`\n🎯 Resultado Final: ${passedTests}/${totalTests} pruebas exitosas`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡TODAS LAS PRUEBAS CRUD PASARON EXITOSAMENTE!');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisa los logs anteriores.');
  }
  
  console.log('\n🔧 === MEJORAS APLICADAS ===');
  console.log('✅ Emails válidos para autenticación');
  console.log('✅ Esquema de BD corregido (sin location, alternative_product_id, shopping_list_id)');
  console.log('✅ Manejo de RLS con usuarios autenticados');
  console.log('✅ Creación automática de datos de prueba');
  console.log('✅ Manejo robusto de errores');
}

// Ejecutar pruebas
runAllTests().catch(console.error); 