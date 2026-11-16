"use client";

import { RiUserAddLine } from "@remixicon/react";
import { Button, Input, Modal } from "@orra-ui/react";

export default function ModalOverview() {
  return (
    <Modal
      trigger={<Button startIcon={<RiUserAddLine />}>邀请成员</Button>}
      title="邀请成员加入「增长实验室」"
      description="对方会收到一封邀请邮件，接受后即可查看本工作区的看板与报表。"
      footer={({ close }) => (
        <>
          <Button variant="outline" tone="neutral" onPress={close}>
            取消
          </Button>
          <Button onPress={close}>发送邀请</Button>
        </>
      )}
    >
      <div className="flex flex-col gap-4">
        <Input label="邮箱地址" type="email" placeholder="name@company.com" autoFocus />
        <Input label="附言（可选）" placeholder="欢迎加入，一起看看本季度的增长数据！" />
      </div>
    </Modal>
  );
}
