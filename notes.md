# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component | Backend endpoints | Database SQL |
| --------------------------------------------------- | ------------------ | ----------------- | ------------ |
| View home page                                      | home.jsx           |        none       |   none       |
| Register new user<br/>(t@jwt.com, pw: test)         |       register.tsx             |    [POST] /api/auth
[PUT] /api/auth               |       INSERT INTO user (name, email, password) VALUES (?, ?, ?)
INSERT INTO auth (token, userId) VALUES (?, ?)       |
| Login new user<br/>(t@jwt.com, pw: test)            |        login.tsx            |      [PUT] /api/auth	             |       SELECT * FROM user WHERE email=?
SELECT * FROM userRole WHERE userId=?
INSERT INTO auth (token, userId) VALUES (?, ?)       |
| Order pizza                                         |         menu.tsx
payment.tsx
deliver.tsx           |      [GET] /api/order/menu
GET /api/franchise
[POST] /api/order             |       SELECT userId FROM auth WHERE token=?
SELECT * FROM menu
SELECT id, name FROM franchise
INSERT INTO dinerOrder (dinerId, franchiseId, storeId, date) VALUES (?, ?, ?, now())
INSERT INTO orderItem (orderId, menuId, description, price) VALUES (?, ?, ?, ?)
SELECT id FROM menu WHERE id=?       |
| Verify pizza                                        |                    |                   |              |
| View profile page                                   |                    |                   |              |
| View franchise<br/>(as diner)                       |                    |                   |              |
| Logout                                              |                    |                   |              |
| View About page                                     |                    |                   |              |
| View History page                                   |                    |                   |              |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) |                    |                   |              |
| View franchise<br/>(as franchisee)                  |                    |                   |              |
| Create a store                                      |                    |                   |              |
| Close a store                                       |                    |                   |              |
| Login as admin<br/>(a@jwt.com, pw: admin)           |                    |                   |              |
| View Admin page                                     |                    |                   |              |
| Create a franchise for t@jwt.com                    |                    |                   |              |
| Close the franchise for t@jwt.com                   |                    |                   |              |
