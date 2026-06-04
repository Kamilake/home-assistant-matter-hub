import {
  type BridgeDataWithMetadata,
  type CreateBridgeRequest,
  HomeAssistantMatcherType,
} from "@home-assistant-matter-hub/common";
import Add from "@mui/icons-material/Add";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import Launch from "@mui/icons-material/Launch";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { EntityAutocomplete } from "../../components/entity-mapping/EntityAutocomplete.tsx";
import { useNotifications } from "../../components/notifications/use-notifications.ts";
import {
  useBridges,
  useCreateBridge,
  useDeleteBridge,
} from "../../hooks/data/bridges.ts";
import { navigation } from "../../routes.tsx";
import { loadBridges } from "../../state/bridges/bridge-actions.ts";
import { useAppDispatch } from "../../state/hooks.ts";

// A standalone device is a server-mode bridge holding exactly one entity.
function deviceEntityId(bridge: BridgeDataWithMetadata): string | undefined {
  return bridge.filter?.include?.[0]?.value;
}

async function fetchNextPort(): Promise<number> {
  const res = await fetch("api/matter/next-port");
  if (!res.ok) return 5540;
  const data = (await res.json()) as { port?: number };
  return data.port ?? 5540;
}

export const StandaloneDevicesPage = () => {
  const { t } = useTranslation();
  const notifications = useNotifications();
  const dispatch = useAppDispatch();
  const { content: bridges, isLoading } = useBridges();
  const createBridge = useCreateBridge();
  const deleteBridge = useDeleteBridge();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [entityId, setEntityId] = useState("");
  const [saving, setSaving] = useState(false);

  const devices = (bridges ?? []).filter(
    (bridge) => bridge.featureFlags?.serverMode === true,
  );

  const handleCreate = useCallback(async () => {
    const trimmedName = name.trim();
    const trimmedEntity = entityId.trim();
    if (!trimmedName || !trimmedEntity) {
      return;
    }
    setSaving(true);
    try {
      const port = await fetchNextPort();
      const request: CreateBridgeRequest = {
        name: trimmedName,
        port,
        filter: {
          include: [
            { type: HomeAssistantMatcherType.Pattern, value: trimmedEntity },
          ],
          exclude: [],
        },
        featureFlags: { serverMode: true },
      };
      await createBridge(request);
      notifications.show({
        message: t("standaloneDevices.created", "Standalone device created"),
        severity: "success",
      });
      setDialogOpen(false);
      setName("");
      setEntityId("");
      dispatch(loadBridges());
    } catch (e) {
      notifications.show({
        message:
          e instanceof Error
            ? e.message
            : t("standaloneDevices.createFailed", "Could not create device"),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [name, entityId, createBridge, notifications, t, dispatch]);

  const handleDelete = useCallback(
    async (bridge: BridgeDataWithMetadata) => {
      try {
        await deleteBridge(bridge.id);
        notifications.show({
          message: t("standaloneDevices.deleted", "Standalone device deleted"),
          severity: "success",
        });
        dispatch(loadBridges());
      } catch (e) {
        notifications.show({
          message:
            e instanceof Error
              ? e.message
              : t("standaloneDevices.deleteFailed", "Could not delete device"),
          severity: "error",
        });
      }
    },
    [deleteBridge, notifications, t, dispatch],
  );

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h5" component="h1">
          {t("standaloneDevices.title", "Standalone Devices")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          {t("standaloneDevices.create", "Add device")}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t(
          "standaloneDevices.subtitle",
          "Each device runs on its own Matter node with its own pairing code, instead of inside a bridge.",
        )}
      </Typography>

      {isLoading && !bridges ? (
        <CircularProgress />
      ) : devices.length === 0 ? (
        <Alert severity="info">
          {t(
            "standaloneDevices.empty",
            "No standalone devices yet. Add one to expose a single entity as its own Matter device.",
          )}
        </Alert>
      ) : (
        <Stack spacing={1}>
          {devices.map((device) => (
            <Card key={device.id} variant="outlined">
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>
                    {device.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {deviceEntityId(device) ??
                      t("standaloneDevices.noEntity", "no entity")}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={device.status} />
                  <Tooltip
                    title={t(
                      "standaloneDevices.openBridge",
                      "Open details and pairing",
                    )}
                  >
                    <IconButton
                      component={Link}
                      to={navigation.bridge(device.id)}
                      size="small"
                    >
                      <Launch fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("common.delete", "Delete")}>
                    <IconButton
                      onClick={() => handleDelete(device)}
                      size="small"
                      color="error"
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("standaloneDevices.create", "Add device")}</DialogTitle>
        <DialogContent>
          <TextField
            label={t("standaloneDevices.name", "Name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            slotProps={{ htmlInput: { maxLength: 64 } }}
          />
          <EntityAutocomplete
            value={entityId}
            onChange={setEntityId}
            label={t("standaloneDevices.entity", "Entity")}
            helperText={t(
              "standaloneDevices.entityHelp",
              "Exactly one entity is exposed as this device.",
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={saving || !name.trim() || !entityId.trim()}
          >
            {saving
              ? t("standaloneDevices.creating", "Creating")
              : t("common.create", "Create")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
