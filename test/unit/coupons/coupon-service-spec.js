/*
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2014 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 */

describe('Coupon Service Test:', function () {

    var $scope, $rootScope, couponUrl, cartUrl, mockBackend;
    var CartREST = {};
    var CouponSvc = {};
    var AuthSvc = {
        isAuthenticated: jasmine.createSpy('isAuthenticated').andReturn(true)
    };
    var mockCoupon = {
            code: '',
            applied: false,
            valid: true,
            message : {
                error: 'Code not valid',
                success: 'Applied'
            },
            amounts : {
                originalAmount: 0,
                discountAmount: 0
            }
        };
    var UserCoupon = {};
    var storeTenant = '121212';
    var eng = 'English';
    var usd = 'US Dollar';
    var mockedGlobalData = {
        store: {tenant: storeTenant},
        setLanguage: jasmine.createSpy('setLanguage'),
        setCurrency: jasmine.createSpy('setCurrency'),
        getLanguageCode: function(){ return null},
        getCurrencyId: function() { return null},
        getCurrencySymbol: function () {return '$'},
        getAvailableLanguages: function() { return [{id:'en', label:eng}]},
        getAvailableCurrency: function() { return 'USD'},
        getCurrency: function() { return null},
        addresses:  {
            meta: {
                total: 0
            }
        },
        getCurrencyId: function () { return 'USD'; },
        getSiteCode: function () { return 'US'; }
    };

    var mockedAppConfig = {
        storeTenant: function(){
            return '121212/';
        },
        dynamicDomain: function(){
            return 'api.yaas.io';
        }
    };

    beforeEach(module('ds.cart', function ($provide) {
    }));

    beforeEach(module('ds.coupon', function ($provide) {
        $provide.value('GlobalData', mockedGlobalData);
    }));

    beforeEach(function() {
        module('ds.shared', function ($provide) {
            $provide.constant('appConfig', {} );
            $provide.value('GlobalData', mockedGlobalData);
            $provide.value('AuthSvc', AuthSvc);
            $provide.constant('appConfig', mockedAppConfig );
        });
    });

    beforeEach(function() {
        module('restangular');
    });

    beforeEach(inject(function( SiteConfigSvc, _CouponSvc_, _UserCoupon_, _$rootScope_, _CouponREST_, CartREST, _$httpBackend_) {
        $scope = _$rootScope_.$new();
        UserCoupon = _UserCoupon_;
        CouponREST = _CouponREST_;
        CouponSvc = _CouponSvc_;

        mockBackend = _$httpBackend_;
        couponUrl = SiteConfigSvc.apis.coupon.baseUrl;
        cartUrl = SiteConfigSvc.apis.cart.baseUrl;
    }));

    describe('Coupon Service ', function () {

        it('should exist', function () {
            expect(CouponSvc.getValidateCoupon).toBeDefined();
            expect(CouponSvc.validateCoupon).toBeDefined();
            expect(CouponSvc.redeemCoupon).toBeDefined();
            expect(CouponSvc.buildCouponCartRequest).toBeDefined();
            expect(CouponSvc.buildCouponRequest).toBeDefined();
        });

        it("should get a coupon", function() {

            var getPayload = {"Accept":"application/json, text/plain, */*"},
            postPayload = {"orderCode":"CouponCode","orderTotal":{"currency":"USD","amount":9.99},"discount":{"currency":"USD","amount":null}},
            response = {},
            successSpy = jasmine.createSpy('success'),
            errorSpy = jasmine.createSpy('error');

            mockBackend.expectGET(couponUrl +'coupons/CouponCode', getPayload).respond(200, response);

            var promise = CouponSvc.getCoupon('CouponCode');
             promise.then(successSpy, errorSpy);

            mockBackend.flush();

            expect(promise.then).toBeDefined();
            expect(successSpy).not.toHaveBeenCalled();
            expect(errorSpy).toHaveBeenCalled();

        });

        it("should validate a fixed rate coupon", function() {

            var getPayload = {"Accept":"application/json, text/plain, */*"},
            postPayload = {"orderCode":"CouponCode","orderTotal":{"currency":"USD","amount":9.99},"discount":{"currency":"USD","amount":null}},
            response = {},
            successSpy = jasmine.createSpy('success'),
            errorSpy = jasmine.createSpy('error');

            mockBackend.expectPOST(couponUrl +'coupons/CouponCode/validation', postPayload).respond(200, response);

            var couponData = {discountType: 'ABSOLUTE', discountAbsolute: {amount:null} }
            var promise = CouponSvc.validateCoupon('CouponCode', 9.99, couponData);
             promise.then(successSpy, errorSpy);

            mockBackend.flush();

            expect(promise.then).toBeDefined();
            expect(successSpy).toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();

        });

        it("should validate a percentage coupon", function() {

            var getPayload = {"Accept":"application/json, text/plain, */*"},
            postPayload = {"orderCode":"CouponCode","orderTotal":{"currency":"USD","amount":9.99},"discount":{"currency":"USD","amount":null}},
            response = {},
            successSpy = jasmine.createSpy('success'),
            errorSpy = jasmine.createSpy('error');

            mockBackend.expectPOST(couponUrl +'coupons/CouponCode/validation', postPayload).respond(200, response);

            var couponData = {discountType: 'PERCENTAGE', discountAbsolute: {amount:null} }
            var promise = CouponSvc.validateCoupon('CouponCode', 9.99, couponData);
             promise.then(successSpy, errorSpy);

            mockBackend.flush();

            expect(promise.then).toBeDefined();
            expect(successSpy).toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();

        });

        it("should getvalidate a fixed rate coupon", function() {

            var getPayload = {"Accept":"application/json, text/plain, */*"},
            response = {},
            successSpy = jasmine.createSpy('success'),
            errorSpy = jasmine.createSpy('error');

            mockBackend.expectGET(couponUrl +'coupons/CouponCode').respond(200, response);

            var promise = CouponSvc.getValidateCoupon('CouponCode', 19.99);
             promise.then(successSpy, errorSpy);

            mockBackend.flush();

            expect(promise.then).toBeDefined();
            expect(successSpy).not.toHaveBeenCalled();
            expect(errorSpy).toHaveBeenCalled();

        });


        it("should redeem a coupon", function() {

            var couponObj = {code:'1234', name:'something', amounts:{discountAmount:1.99}};
            var couponCartRequest = {"amount":1.99,"code":"1234","currency":"USD","name":"something","calculationType":"ApplyDiscountBeforeTax","links":[{"rel":"validate","href":"https://api.yaas.io/hybris/coupon/b1/121212/coupons/1234/validation","type":"application/json","title":"Discounts Validate"},{"rel":"redeem","href":"https://api.yaas.io/hybris/coupon/b1/121212/coupons/1234/redemptions","type":"application/json","title":"Discounts Redeem"}],"sequenceId":1},
            couponRequest = CouponSvc.buildCouponRequest( '1234', 'USD', 9.99, 1.99 ),
            response = {},
            successSpy = jasmine.createSpy('success'),
            errorSpy = jasmine.createSpy('error');

            mockBackend.expectPOST(couponUrl +'coupons/1234/redemptions', couponRequest).respond(200, response);
            mockBackend.expectPOST(cartUrl +'carts/12345/discounts', couponCartRequest).respond(200, response);
            var promise = CouponSvc.redeemCoupon( couponObj, '12345', 9.99 );
            promise.then(successSpy, errorSpy);

            mockBackend.flush();

            expect(promise.then).toBeDefined();
            expect(successSpy).toHaveBeenCalled();
            expect(errorSpy).not.toHaveBeenCalled();

        });

        it("should build request objects", function() {
            var couponObj = {code:'1234', name:'something', amounts:{discountAmount:1.99}};
            var couponRequest = CouponSvc.buildCouponRequest( '1234', 'USD', 9.99, 1.99 );
            var couponCartRequest = CouponSvc.buildCouponCartRequest( couponObj, '12345', 'USD' );

            expect(couponRequest.orderCode).toBe('1234');
            expect(couponRequest.discount.currency).toBe('USD');
            expect(couponRequest.orderTotal.amount).toBe(9.99);
            expect(couponRequest.discount.amount).toBe(1.99);
            expect(couponCartRequest.code).toBe('1234');
            expect(couponCartRequest.id).toBe('12345');
            expect(couponCartRequest.currency).toBe('USD');

        });

        it("should validate currency", function() {
            var couponData = {restrictions:{minOrderValue:{currency:'USD'}}};
            var validation = CouponSvc.validateCurrency( couponData );
            expect(validation).toBe(true);
            couponData = {restrictions:{minOrderValue:{currency:'EUR'}}};
            validation = CouponSvc.validateCurrency( couponData );
            expect(validation).toBe(false);


        });


    });

});
