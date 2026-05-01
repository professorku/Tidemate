.PHONY: clean clean-django clean-node clean-all

clean: clean-django clean-node

clean-django:
	@echo "Cleaning Django artifacts..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.log" -delete
	rm -rf .pytest_cache
	rm -rf .mypy_cache
	rm -rf build
	rm -rf dist
	rm -rf *.egg-info
	rm -rf backend/db.sqlite3

clean-node:
	@echo "Cleaning npm artifacts..."
	rm -rf frontend/node_modules
	rm -rf .npm
	rm -rf dist
	rm -rf build

clean-all: clean
	@echo "Project cleaned."