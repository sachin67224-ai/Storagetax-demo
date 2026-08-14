# Home Loan EMI Calculator

Flask app with a live EMI calculator (principal, interest rate, tenure), a
brick-house visualization of principal vs. interest, and a yearly
amortization chart.

## Run locally

```bash
pip install -r requirements.txt
python app.py
# open http://localhost:5000
```

## Build and push the container image

```bash
docker build -t <YOUR_REGISTRY>/emi-calculator:latest .
docker push <YOUR_REGISTRY>/emi-calculator:latest
```

If you're using Azure Container Registry (ACR):

```bash
az acr build --registry <YOUR_ACR_NAME> --image emi-calculator:latest .
```

## Deploy through ArgoCD (GitOps)

1. Update `k8s/deployment.yaml` — replace `<YOUR_REGISTRY>/emi-calculator:latest`
   with your actual image path.
2. Copy this whole folder's contents into your `storagetax-gitops` repo at
   `apps/emi-calculator/` (the `argocd-application.yaml` file points ArgoCD
   at `apps/emi-calculator/k8s`, so keep that path — or edit it to match
   wherever you place the manifests).
3. Commit and push `storagetax-gitops`.
4. Apply the ArgoCD `Application` resource once, from your local machine:

   ```bash
   kubectl apply -f argocd-application.yaml
   ```

   After this, ArgoCD watches the repo — any future changes to the
   manifests in `apps/emi-calculator/k8s` auto-sync to the cluster. You
   won't need to run `kubectl apply` again for this app.

5. Check sync status:

   ```bash
   kubectl get applications -n argocd
   ```

6. (Optional) Apply `k8s/ingress.yaml` once DNS for `emi.storagetax.com`
   points at your cluster's ingress IP.
