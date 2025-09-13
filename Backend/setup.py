from setuptools import setup, find_packages

setup(
    name='helpdesk-backend',
    version='0.1',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask',
        'flask-cors',
        'flask-jwt-extended',
        'python-dotenv',
        'mysql-connector-python',
        'twilio',
        'requests'
    ],
)