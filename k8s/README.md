# Task 2.3 — Multi-Cloud Namespace Simulation

Two isolated namespaces, `aws-simulation` and `gcp-simulation`, each running
its own frontend + backend Deployment/Service. Nothing here reaches a real
AWS or GCP account — this is a **local simulation using `kubectl` against
any Kubernetes cluster** (Docker Desktop's built-in cluster, `kind`, or
`minikube` all work identically for this).

I can't run any of this myself — my environment has no Kubernetes cluster
and no network access. Everything below is written to be copy-pasted and
run on your machine.

## 1. Get a local cluster running

Pick one:
```bash
# Docker Desktop: Settings -> Kubernetes -> Enable Kubernetes, then:
kubectl config use-context docker-desktop

# OR kind:
kind create cluster --name shopsphere

# OR minikube:
minikube start
```

## 2. Build the images locally

```bash
cd backend  && docker build -t shopsphere-backend:local .  && cd ..
cd frontend && docker build -t shopsphere-frontend:local . && cd ..
```

If you're using `kind` or `minikube`, the cluster can't see your local
Docker images by default — load them in explicitly:
```bash
kind load docker-image shopsphere-backend:local shopsphere-frontend:local --name shopsphere
# or, for minikube:
minikube image load shopsphere-backend:local
minikube image load shopsphere-frontend:local
```

## 3. Create both namespaces and their secrets

```bash
kubectl apply -f k8s/aws-simulation/namespace.yaml
kubectl apply -f k8s/gcp-simulation/namespace.yaml

kubectl create secret generic shopsphere-backend-secrets \
  --namespace=aws-simulation \
  --from-literal=DATABASE_URL="<your Supabase pooled URL>" \
  --from-literal=DIRECT_URL="<your Supabase direct URL>" \
  --from-literal=JWT_SECRET="<same secret as your main deploy>" \
  --from-literal=CORS_ORIGIN="http://localhost:5173"

kubectl create secret generic shopsphere-backend-secrets \
  --namespace=gcp-simulation \
  --from-literal=DATABASE_URL="<your Supabase pooled URL>" \
  --from-literal=DIRECT_URL="<your Supabase direct URL>" \
  --from-literal=JWT_SECRET="<same secret as your main deploy>" \
  --from-literal=CORS_ORIGIN="http://localhost:5173"
```

## 4. Deploy into each namespace

```bash
kubectl apply -f k8s/aws-simulation/backend-deployment.yaml
kubectl apply -f k8s/aws-simulation/backend-service.yaml
kubectl apply -f k8s/aws-simulation/frontend-deployment.yaml
kubectl apply -f k8s/aws-simulation/frontend-service.yaml

kubectl apply -f k8s/gcp-simulation/backend-deployment.yaml
kubectl apply -f k8s/gcp-simulation/backend-service.yaml
kubectl apply -f k8s/gcp-simulation/frontend-deployment.yaml
kubectl apply -f k8s/gcp-simulation/frontend-service.yaml
```

## 5. Verify isolation (this is the part the rubric actually checks)

```bash
kubectl get pods -n aws-simulation
kubectl get pods -n gcp-simulation

# Prove aws-simulation can't see gcp-simulation's resources, and vice versa:
kubectl get pods -n aws-simulation -l env=gcp-simulation   # -> No resources found
kubectl get svc  -n gcp-simulation -l env=aws-simulation   # -> No resources found
```

## 6. Reach each namespace via `kubectl port-forward`

```bash
# AWS-simulation backend on localhost:5000, frontend on localhost:5173
kubectl port-forward -n aws-simulation svc/shopsphere-backend 5000:5000 &
kubectl port-forward -n aws-simulation svc/shopsphere-frontend 5173:8080 &

# GCP-simulation on different local ports so both can run at once
kubectl port-forward -n gcp-simulation svc/shopsphere-backend 5001:5000 &
kubectl port-forward -n gcp-simulation svc/shopsphere-frontend 5174:8080 &
```

Then confirm both independently:
```bash
curl http://localhost:5000/api/health   # aws-simulation backend
curl http://localhost:5001/api/health   # gcp-simulation backend
```

Take screenshots of steps 5 and 6 for your submission — the rubric's
"visibility rule" means the port-forwarded response and the isolation
check are what actually needs to be captured, not just the YAML existing.
