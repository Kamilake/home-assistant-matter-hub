import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    "index",
    {
      type: "category",
      label: "시작하기",
      items: [
        "getting-started/installation",
        "getting-started/bridge-configuration",
        "getting-started/standalone-devices",
        "getting-started/migration-from-t0bst4r",
      ],
    },
    {
      type: "category",
      label: "기기",
      link: { type: "doc", id: "supported-device-types" },
      items: [
        "devices/light",
        "devices/climate",
        "devices/cover",
        "devices/lock",
        "devices/robot-vacuum",
        "devices/air-purifier",
        "devices/temperature-humidity-sensor",
      ],
    },
    {
      type: "category",
      label: "가이드",
      items: [
        "guides/connect-multiple-fabrics",
        "guides/alexa-bulk-delete-devices",
        "guides/reverse-proxy",
        "guides/alpha-features",
        "guides/testing-features",
      ],
    },
    {
      type: "category",
      label: "플러그인",
      items: ["guides/plugin-system"],
    },
    {
      type: "category",
      label: "레퍼런스",
      items: [
        "guides/api-reference",
        "guides/controller-compatibility",
        "guides/mapping-blueprints",
      ],
    },
    {
      type: "category",
      label: "문제 해결",
      items: [
        "guides/connectivity-issues",
        "guides/low-resource-devices",
        "faq",
      ],
    },
    {
      type: "category",
      label: "개발자",
      items: [
        "developer/index",
        "developer/services",
        "developer/endpoints",
        "developer/behaviors",
      ],
    },
    "support",
  ],
};

export default sidebars;
