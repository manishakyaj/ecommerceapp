from flask import Flask, jsonify, request
from functools import wraps
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
from datetime import datetime, timedelta
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:postgres@localhost:5432/ecommerce'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

db = SQLAlchemy(app)
jwt = JWTManager(app)
CORS(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    original_price = db.Column(db.Float)
    image = db.Column(db.String(500))
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'))
    category = db.relationship('Category', backref=db.backref('products', lazy=True))
    brand = db.Column(db.String(100))
    rating = db.Column(db.Float, default=0)
    stock = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# (Product relationship defined on the model class above)

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')
    shipping_address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/api/products', methods=['GET'])
def get_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    category = request.args.get('category')
    search = request.args.get('search')
    
    query = Product.query
    
    if category:
        # filter by category name via join
        query = query.join(Category).filter(Category.name == category)
    
    if search:
        query = query.filter(Product.name.contains(search))
    
    products = query.paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [{
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'original_price': p.original_price,
            'image': p.image,
            'category': p.category.name if p.category else None,
            'brand': p.brand,
            'rating': p.rating,
            'stock': p.stock
        } for p in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': page
    })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify({
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'original_price': product.original_price,
        'image': product.image,
    'category': product.category.name if product.category else None,
        'brand': product.brand,
        'rating': product.rating,
        'stock': product.stock
    })

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{'id': c.id, 'name': c.name} for c in categories])


# Simple admin auth decorator (header X-ADMIN-SECRET or ?secret=)
def admin_required(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        provided = request.args.get('secret') or request.headers.get('X-ADMIN-SECRET')
        expected = os.environ.get('ADMIN_SECRET', 'adminsecret')
        if provided != expected:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return wrapped


# Admin: create category
@app.route('/api/categories', methods=['POST'])
@admin_required
def create_category():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'error': 'name required'}), 400
    if Category.query.filter_by(name=name).first():
        return jsonify({'error': 'category exists'}), 400
    c = Category(name=name, description=data.get('description'))
    db.session.add(c)
    db.session.commit()
    return jsonify({'id': c.id, 'name': c.name}), 201


@app.route('/api/categories/<int:cat_id>', methods=['PATCH'])
@admin_required
def update_category(cat_id):
    c = Category.query.get_or_404(cat_id)
    data = request.get_json() or {}
    if 'name' in data:
        c.name = data['name']
    if 'description' in data:
        c.description = data['description']
    db.session.commit()
    return jsonify({'id': c.id, 'name': c.name})


@app.route('/api/categories/<int:cat_id>', methods=['DELETE'])
@admin_required
def delete_category(cat_id):
    c = Category.query.get_or_404(cat_id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'deleted'})


# Admin: create product
@app.route('/api/products', methods=['POST'])
@admin_required
def create_product():
    data = request.get_json() or {}
    name = data.get('name')
    price = data.get('price')
    if not name or price is None:
        return jsonify({'error': 'name and price required'}), 400
    # accept category_id or category_name
    category_obj = None
    if data.get('category_id'):
        category_obj = Category.query.get(data.get('category_id'))
    elif data.get('category_name'):
        category_obj = Category.query.filter_by(name=data.get('category_name')).first()
    product = Product(
        name=name,
        description=data.get('description'),
        price=price,
        original_price=data.get('original_price'),
        image=data.get('image'),
        brand=data.get('brand'),
        rating=data.get('rating', 0),
        stock=data.get('stock', 0),
    )
    if category_obj:
        product.category = category_obj
    db.session.add(product)
    db.session.commit()
    return jsonify({'id': product.id, 'name': product.name}), 201


@app.route('/api/products/<int:product_id>', methods=['PATCH'])
@admin_required
def update_product(product_id):
    p = Product.query.get_or_404(product_id)
    data = request.get_json() or {}
    for field in ['name','description','price','original_price','image','brand','rating','stock']:
        if field in data:
            setattr(p, field, data[field])
    # category update
    if 'category_id' in data:
        cat = Category.query.get(data['category_id'])
        if cat:
            p.category = cat
    db.session.commit()
    return jsonify({'id': p.id, 'name': p.name})


@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    p = Product.query.get_or_404(product_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message':'deleted'})


# Admin: list orders
@app.route('/api/orders', methods=['GET'])
@admin_required
def admin_get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    out = []
    for o in orders:
        out.append({
            'id': o.id,
            'user_id': o.user_id,
            'total_amount': o.total_amount,
            'status': o.status,
            'shipping_address': o.shipping_address,
            'created_at': o.created_at.isoformat()
        })
    return jsonify(out)


# Admin: simple sales summary
@app.route('/api/sales', methods=['GET'])
@admin_required
def admin_sales():
    total = db.session.query(db.func.coalesce(db.func.sum(Order.total_amount), 0)).scalar()
    count = db.session.query(db.func.count(Order.id)).scalar()
    return jsonify({'total_sales': float(total), 'order_count': int(count)})

@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    
    cart_data = []
    for item in cart_items:
        product = Product.query.get(item.product_id)
        cart_data.append({
            'id': item.id,
            'product': {
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'image': product.image
            },
            'quantity': item.quantity
        })
    
    return jsonify(cart_data)

@app.route('/api/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    existing_item = CartItem.query.filter_by(
        user_id=user_id, 
        product_id=data['product_id']
    ).first()
    
    if existing_item:
        existing_item.quantity += data.get('quantity', 1)
    else:
        new_item = CartItem(
            user_id=user_id,
            product_id=data['product_id'],
            quantity=data.get('quantity', 1)
        )
        db.session.add(new_item)
    
    db.session.commit()
    return jsonify({'message': 'Item added to cart'})

@app.route('/api/cart/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    user_id = get_jwt_identity()
    item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item removed from cart'})
    
    return jsonify({'error': 'Item not found'}), 404

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        password=data['password'],  # In production, hash this password
        name=data['name']
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.password == data['password']:  # In production, verify hashed password
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

# Initialize database and seed data
def init_db():
    with app.app_context():
        # Drop all tables and recreate them to ensure fresh data
        db.drop_all()
        db.create_all()
        
        # Seed categories first
        category_names = [
            'Fruits', 'Meat & Poultry', 'Bakery', 'Seafood', 'Vegetables', 'Dairy', 'Pantry'
        ]
        categories = {}
        for name in category_names:
            c = Category(name=name)
            db.session.add(c)
            categories[name] = c
        db.session.flush()

        # Seed products (associate with Category objects)
        products = [
            Product(
                name="Fresh Organic Bananas",
                description="Sweet and nutritious organic bananas, perfect for snacking or smoothies",
                price=3.99,
                original_price=4.99,
                image="https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
                category=categories.get('Fruits'),
                brand="Fresh Farm",
                rating=4.5,
                stock=50
            ),
            Product(
                name="Premium Ground Beef",
                description="Fresh, lean ground beef perfect for burgers, meatballs, and pasta dishes",
                price=12.99,
                original_price=15.99,
                image="https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400",
                category=categories.get('Meat & Poultry'),
                brand="Farm Fresh",
                rating=4.7,
                stock=25
            ),
            Product(
                name="Artisan Sourdough Bread",
                description="Handcrafted sourdough bread with a crispy crust and soft, tangy interior",
                price=6.99,
                original_price=8.99,
                image="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
                category=categories.get('Bakery'),
                brand="Bread & Butter",
                rating=4.8,
                stock=15
            ),
            Product(
                name="Fresh Salmon Fillet",
                description="Atlantic salmon fillet, rich in omega-3 fatty acids and perfect for grilling",
                price=18.99,
                original_price=22.99,
                image="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400",
                category=categories.get('Seafood'),
                brand="Ocean Fresh",
                rating=4.6,
                stock=12
            ),
            Product(
                name="Organic Spinach",
                description="Fresh, crisp organic spinach leaves, great for salads and cooking",
                price=4.49,
                original_price=5.49,
                image="https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
                category=categories.get('Vegetables'),
                brand="Green Valley",
                rating=4.4,
                stock=30
            ),
            Product(
                name="Greek Yogurt",
                description="Creamy, protein-rich Greek yogurt perfect for breakfast or snacks",
                price=5.99,
                original_price=7.99,
                image="https://images.unsplash.com/photo-1571212058562-4b5f4b4b8b8b?w=400",
                category=categories.get('Dairy'),
                brand="Creamy Delights",
                rating=4.3,
                stock=20
            ),
            Product(
                name="Fresh Strawberries",
                description="Sweet, juicy strawberries perfect for desserts, smoothies, or snacking",
                price=7.99,
                original_price=9.99,
                image="https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
                category=categories.get('Fruits'),
                brand="Berry Farm",
                rating=4.6,
                stock=35
            ),
            Product(
                name="Free-Range Eggs",
                description="Farm-fresh free-range eggs from happy, healthy chickens",
                price=4.99,
                original_price=6.99,
                image="https://images.unsplash.com/photo-1518569656558-1f25e69d93d5?w=400",
                category=categories.get('Dairy'),
                brand="Happy Hens",
                rating=4.7,
                stock=40
            ),
            Product(
                name="Extra Virgin Olive Oil",
                description="Premium cold-pressed extra virgin olive oil from Mediterranean olives",
                price=15.99,
                original_price=19.99,
                image="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400",
                category=categories.get('Pantry'),
                brand="Mediterranean Gold",
                rating=4.8,
                stock=18
            ),
            Product(
                name="Fresh Mozzarella",
                description="Fresh, creamy mozzarella cheese perfect for caprese salad and pizza",
                price=8.99,
                original_price=11.99,
                image="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400",
                category=categories.get('Dairy'),
                brand="Italian Delights",
                rating=4.5,
                stock=22
            ),
            Product(
                name="Organic Quinoa",
                description="Nutritious organic quinoa, a complete protein perfect for healthy meals",
                price=9.99,
                original_price=12.99,
                image="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
                category=categories.get('Pantry'),
                brand="Health Foods",
                rating=4.4,
                stock=28
            ),
            Product(
                name="Fresh Avocados",
                description="Creamy, ripe avocados perfect for guacamole, toast, or salads",
                price=4.99,
                original_price=6.99,
                image="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
                category=categories.get('Fruits'),
                brand="Tropical Fresh",
                rating=4.6,
                stock=25
            )
        ]
        
        for product in products:
            db.session.add(product)
        
        db.session.commit()
        print("Database seeded with sample food products!")


# Admin endpoint to seed database on demand (POST /api/admin/seed)
# Protect with an environment variable SEED_SECRET (default 'seedme')
@app.route('/api/admin/seed', methods=['POST'])
def admin_seed():
    # secret can be provided as query param ?secret= or as header X-SEED-SECRET
    provided = request.args.get('secret') or request.headers.get('X-SEED-SECRET')
    expected = os.environ.get('SEED_SECRET', 'seedme')
    if provided != expected:
        return jsonify({'error': 'Unauthorized'}), 401
    init_db()
    return jsonify({'message': 'Database seeded'})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
