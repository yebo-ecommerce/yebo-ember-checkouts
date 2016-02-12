import Ember from 'ember';
import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('serializer:order', {
  // Specify the other units that are required for this test.
  needs: [
    'service:checkouts',
    'service:yebo',
    'store:yebo',
    'serializer:yebo',
    'model:order',
    'model:user',
    'model:lineItem',
    'model:variant',
    'model:shipment',
    'model:shippingMethod',
    'model:shippingCategory',
    'model:shippingRate',
    'model:zone',
    'model:stockLocation',
    'model:payment',
    'model:paymentMethod',
    'model:source',
    'model:address', 
    'model:state', 
    'model:country',
    'transform:raw'
  ]
});

test('it exists', function(assert) {
  var serializer = this.subject();
  assert.ok(serializer);
});

test('it serializes correctly on the address state', function(assert) {
  var serializer = this.subject();
  assert.ok(serializer);
  
  var yeboStore = this.container.lookup('store:yebo');
  var checkouts  = this.container.lookup('service:checkouts');

  checkouts.set('currentState', 'address');
  
  Ember.run(function() {

    var order = yeboStore.createRecord('order', {
      _useCheckoutsEndpoint: true
    });

    var USA = yeboStore.createRecord('country', {
      name: 'United States'
    });

    var NY = yeboStore.createRecord('state', {
      name: 'New York'
    });

    var shipAddress = yeboStore.createRecord('address', {
      firstname: 'Hugh',
      lastname: 'Francis',
      address1: '123 Street st',
      address2: 'Suite 2',
      city: 'New York City',
      zipcode: '10002',
      phone: '1231231234',
      country: USA, 
      state: NY
    });
    
    order.set('shipAddress', shipAddress);
    order.set('billAddress', shipAddress);
    assert.ok(order);

    var payload = order.serialize();
    
    assert.ok(payload.order.ship_address_attributes);
    assert.ok(payload.order.bill_address_attributes);
    assert.equal(payload.order.ship_address_attributes.city, 'New York City');
  });
});

test('it serializes correctly based on order state', function(assert) {
  var serializer = this.subject();
  assert.ok(serializer);
  
  var yeboStore = this.container.lookup('store:yebo');
  var checkouts  = this.container.lookup('service:checkouts');

  Ember.run(function() {

    checkouts.set('currentState', 'address');
    var order = yeboStore.createRecord('order', {
      _useCheckoutsEndpoint: true
    });

    var USA = yeboStore.createRecord('country', {
      name: 'United States'
    });

    var NY = yeboStore.createRecord('state', {
      name: 'New York'
    });

    var shipAddress = yeboStore.createRecord('address', {
      firstname: 'Hugh',
      lastname: 'Francis',
      address1: '123 Street st',
      address2: 'Suite 2',
      city: 'New York City',
      zipcode: '10002',
      phone: '1231231234',
      country: USA, 
      state: NY
    });
    
    order.set('shipAddress', shipAddress);
    order.set('billAddress', shipAddress);
    assert.ok(order);
    
    var payload = order.serialize();

    assert.ok(payload.order.ship_address_attributes);
    assert.ok(payload.order.bill_address_attributes);
    assert.equal(payload.order.ship_address_attributes.city, 'New York City');

    checkouts.set('currentState', 'delivery');

    payload = order.serialize();

    assert.ok(payload.order.shipments_attributes);

    assert.throws(payload.order.ship_address_attributes);
    assert.throws(payload.order.bill_address_attributes);

    checkouts.set('currentState', 'payment');
    
    var paymentMethod = yeboStore.createRecord('paymentMethod', {
      id: 1
    });
    var payment = yeboStore.createRecord('payment');
    var source  = yeboStore.createRecord('source');
    payment.set('paymentMethod', paymentMethod);
    payment.set('source', source);

    source.setProperties({
      month: 1,
      year: 2019,
      number: "4111111111111111",
      name: "Hugh Francis",
      verificationValue: 123
    });

    order.get('payments').pushObject(payment);

    payload = order.serialize();

    assert.ok(payload.payment_source);
    assert.ok(payload.order.payments_attributes);
    assert.equal(payload.order.payments_attributes[0].payment_method_id, "1");
    assert.equal(payload.payment_source[1].number, 4111111111111111);
    
    assert.throws(payload.order.ship_address_attributes);
    assert.throws(payload.order.bill_address_attributes);
    assert.throws(payload.order.shipments_attributes);
  });
});
