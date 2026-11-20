from django.contrib import admin
from django.urls import path

from shop import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', views.products, name='products'),
    path('api/cart/items/', views.cart_items, name='cart-items'),
    path('api/cart/items/remove/', views.cart_remove, name='cart-remove'),
    path('api/cart/coupon/', views.cart_coupon, name='cart-coupon'),
    path('api/cart/checkout/', views.cart_checkout, name='cart-checkout'),
    path('api/cart/', views.cart_summary, name='cart-summary'),
]
